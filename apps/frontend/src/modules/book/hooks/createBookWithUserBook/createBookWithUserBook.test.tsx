import { expect, it, vi } from 'vitest';
import { createMutationMock } from '../../../../tests/mocks/mutationMock';
import { renderHook } from '@testing-library/react';
import { CreatePayload, useCreateBookWithUserBook } from './createBookWithUserBook';
import { Language, ReadingStatus } from '@common/contracts';

const useCreateBookMock = createMutationMock();
const createUserBookMock = createMutationMock();
const uploadBookImageMock = createMutationMock();

vi.mock('../../api/user/mutations/createBookMutation/createBookMutation', () => ({
  useCreateBookMutation: vi.fn().mockImplementation(() => useCreateBookMock),
}));
vi.mock('../../api/user/mutations/createUserBookMutation/createUserBookMutation', () => ({
  useCreateUserBookMutation: vi.fn().mockImplementation(() => createUserBookMock),
}));
vi.mock('../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation', () => ({
  useUploadBookImageMutation: vi.fn().mockImplementation(() => uploadBookImageMock),
}));

vi.mock('@tanstack/react-query');
vi.mock('@tanstack/react-router');

const renderTestedHook = () => {
  const {
    result: {
      current: { create },
    },
    rerender,
    unmount,
  } = renderHook(() =>
    useCreateBookWithUserBook({
      navigateTo: 'books',
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
    language: Language.Abkhazian,
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

it('throws an error - given no bookId & no bookPayload', async () => {
  const { create } = renderTestedHook();

  const payload = createDummyPayload();
  payload.userBookPayload.bookId = undefined;
  payload.bookPayload = undefined;

  await expect(async () => await create(payload)).rejects.toThrowError(
    'BookId prop is required if book is not being created.',
  );
});
