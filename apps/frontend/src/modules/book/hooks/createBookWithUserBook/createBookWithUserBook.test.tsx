import { beforeEach, expect, it, vi } from 'vitest';
import { createMutationMock } from '../../../../tests/mocks/mutationMock';
import { renderHook } from '@testing-library/react';
import { CreatePayload, useCreateBookWithUserBook } from './createBookWithUserBook';
import { languages, ReadingStatus } from '@common/contracts';
import { useToastMock } from '../../../common/components/toast/__mocks__/use-toast.mocks';
import { queryClientMock } from '../../../../tests/mocks/queryClientMock';

const createBookMock = createMutationMock();
const createUserBookMock = createMutationMock();
const uploadBookImageMock = createMutationMock();

vi.mock('../../api/user/mutations/createBookMutation/createBookMutation', () => ({
  useCreateBookMutation: vi.fn().mockImplementation(() => createBookMock),
}));
vi.mock('../../api/user/mutations/createUserBookMutation/createUserBookMutation', () => ({
  useCreateUserBookMutation: vi.fn().mockImplementation(() => createUserBookMock),
}));
vi.mock('../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation', () => ({
  useUploadBookImageMutation: vi.fn().mockImplementation(() => uploadBookImageMock),
}));

vi.mock('../../../common/components/toast/use-toast', () => ({
  useToast: vi.fn().mockImplementation(() => useToastMock),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn().mockImplementation(() => queryClientMock),
}));

const navigateMock = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn().mockImplementation(() => navigateMock),
}));

const renderTestedHook = (navigateTo: 'shelves' | 'books' = 'books') => {
  const {
    result: {
      current: { create },
    },
    rerender,
    unmount,
  } = renderHook(() =>
    useCreateBookWithUserBook({
      navigateTo,
      onOperationError: () => {},
    }),
  );

  return {
    create,
    rerender,
    unmount,
  };
};

const dummyPayload = {
  bookTitle: 'Allah',
  authorPayload: {
    authorIds: [],
  },
  bookPayload: {
    genreId: '',
    language: languages.Abkhazian,
    releaseYear: 1999,
    title: 'Title',
  },
  userBookPayload: {
    bookId: 'id',
    accessToken: '123',
    bookshelfId: '123',
    isFavorite: false,
    status: ReadingStatus.inProgress,
  },
};
const createDummyPayload = (): CreatePayload => ({
  ...dummyPayload,
  userBookPayload: { ...dummyPayload.userBookPayload },
  authorPayload: { ...dummyPayload.authorPayload },
  bookPayload: { ...dummyPayload.bookPayload },
});

beforeEach(() => vi.clearAllMocks());

it('throws an error - given no bookId & no bookPayload', async () => {
  const { create } = renderTestedHook();

  const payload = createDummyPayload();
  payload.userBookPayload.bookId = undefined;
  payload.bookPayload = undefined;

  await expect(async () => await create(payload)).rejects.toThrowError(
    'BookId prop is required if book is not being created.',
  );
});

it('does not create user book - given book creation fails', async () => {
  const { create } = renderTestedHook();

  const payload = createDummyPayload();
  payload.userBookPayload.bookId = undefined;

  createBookMock.mutateAsync.mockRejectedValueOnce(new Error('OH NO'));

  await create(payload);

  expect(createBookMock.mutateAsync).toHaveBeenCalled();
  expect(createUserBookMock.mutateAsync).not.toHaveBeenCalled();
});

it('does not attempt to create book - given bookId', async () => {
  const { create } = renderTestedHook();

  const payload = createDummyPayload();

  createBookMock.mutateAsync.mockRejectedValueOnce(new Error('OH NO'));

  await create(payload);

  expect(createBookMock.mutateAsync).not.toHaveBeenCalled();
});

it('does not upload image - given userBook creation fails', async () => {
  const { create } = renderTestedHook();

  const payload = createDummyPayload();

  createUserBookMock.mutateAsync.mockRejectedValueOnce(new Error('OH NO'));

  await create(payload);

  expect(createBookMock.mutateAsync).not.toHaveBeenCalled();
  expect(createUserBookMock.mutateAsync).toHaveBeenCalled();
  expect(uploadBookImageMock.mutateAsync).not.toHaveBeenCalled();
});

it('adds toast on success', async () => {
  const { create } = renderTestedHook();

  const payload = createDummyPayload();

  await create(payload);

  expect(useToastMock.toast).toHaveBeenCalledWith({
    description: `Książka ${payload.bookTitle} została położona na półce 😄`,
    title: 'Książka została położona na półce 😄',
    variant: 'success',
  });
});

it('navigates to shelves - given navigateTo shelves', async () => {
  const { create } = renderTestedHook('shelves');

  const payload = createDummyPayload();

  await create(payload);

  const pattern = new RegExp(`^(?=.*shelves)(?=.*${payload.userBookPayload.bookshelfId}).*$`);

  expect(navigateMock).toHaveBeenCalledWith({
    to: expect.stringMatching(pattern),
  });
});

it('navigates to mybooks - given navigateTo books', async () => {
  const { create } = renderTestedHook('books');

  const payload = createDummyPayload();

  await create(payload);

  expect(navigateMock).toHaveBeenCalledWith({
    to: expect.stringContaining('books'),
  });
});
