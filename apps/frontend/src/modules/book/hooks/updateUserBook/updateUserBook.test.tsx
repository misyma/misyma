import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMutationMock } from '../../../../tests/mocks/mutationMock';
import { renderHook } from '@testing-library/react';
import { useUpdateUserBook } from './updateUserBook';
import { queryClientMock } from '../../../../tests/mocks/queryClientMock';
import { useToastMock } from '../../../common/components/toast/__mocks__/use-toast.mocks';
import { ReadingStatus } from '@common/contracts';

const updateUserBookMock = createMutationMock();
const updateBorrowingMock = createMutationMock();
const uploadBookImageMock = createMutationMock();

vi.mock('../../api/user/mutations/updateUserBookMutation/updateUserBookMutation', () => ({
  useUpdateUserBookMutation: vi.fn().mockImplementation(() => updateUserBookMock),
}));

vi.mock('../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation', () => ({
  useUploadBookImageMutation: vi.fn().mockImplementation(() => uploadBookImageMock),
}));

vi.mock('../../../borrowing/api/mutations/updateBorrowingMutation/updateBorrowingMutation', () => ({
  useUpdateBorrowingMutation: vi.fn().mockImplementation(() => updateBorrowingMock),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn().mockImplementation(() => queryClientMock),
  queryOptions: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('../../../common/components/toast/use-toast', () => ({
  useToast: vi.fn().mockImplementation(() => useToastMock),
}));

const useErrorHandledQueryDataCallback = vi.fn().mockReturnValue({
  data: [],
  isLoading: true,
});

vi.mock('../../../common/hooks/useErrorHandledQuery', () => ({
  useErrorHandledQuery: vi.fn().mockImplementation(() => useErrorHandledQueryDataCallback()),
}));

const testBookId = 'very-id';

const renderTestedHook = () => {
  const {
    rerender,
    unmount,
    result: { current },
  } = renderHook(() => useUpdateUserBook(testBookId));

  return {
    rerender,
    unmount,
    ...current,
  };
};

beforeEach(() => vi.clearAllMocks());

describe('update', () => {
  it('uploads book image', async () => {
    const { update } = renderTestedHook();

    await update({
      image: new File([], 'fileName'),
    });

    expect(uploadBookImageMock.mutateAsync).toHaveBeenCalled();
  });
});

describe('setFavorite', () => {
  it('changes isFavorite state', async () => {
    const { setFavorite } = renderTestedHook();

    await setFavorite(true);

    expect(updateUserBookMock.mutateAsync).toHaveBeenCalledWith({
      userBookId: testBookId,
      isFavorite: true,
    });
  });
});

describe('updateBookBookshelf', () => {
  it('adds fail toast - given previousBookshelfName is "Wypożyczalnia" and borrowing has not loaded within retries', async () => {
    const { updateBookBookshelf } = renderTestedHook();

    await updateBookBookshelf({
      bookshelfId: 'bId',
      bookshelfName: 'Mein K',
      currentBookshelfId: 'some id',
      previousBookshelfName: 'Wypożyczalnia',
    });

    expect(useToastMock.toast).toHaveBeenCalledWith({
      title: 'Nie udało się zmienić półki.',
      description: 'Spróbuj ponownie.',
      variant: 'destructive',
    });
  });

  it('omits borrowing check - given "Wypożyczalnia" is not the previous bookshelf', async () => {
    const { updateBookBookshelf } = renderTestedHook();
    const bookshelfName = 'Mein K';

    await updateBookBookshelf({
      bookshelfId: 'bId',
      bookshelfName,
      currentBookshelfId: 'some id',
      previousBookshelfName: 'AAA',
    });

    expect(useToastMock.toast).toHaveBeenCalledWith({
      title: 'Zmieniono półkę.',
      description: 'Książka znajduje się teraz na: ' + bookshelfName,
      variant: 'success',
    });
  });

  it('updates userBook bookshelf', async () => {
    const { updateBookBookshelf } = renderTestedHook();
    const bookshelfId = 'bId';

    await updateBookBookshelf({
      bookshelfId,
      bookshelfName: 'Mein K',
      currentBookshelfId: 'some id',
      previousBookshelfName: 'AAA',
    });

    expect(updateUserBookMock.mutateAsync).toHaveBeenCalledWith({
      userBookId: testBookId,
      bookshelfId,
    });
  });

  it.todo('Cache invalidation tests - Most likely will need to be extracted somewhere...');
  // as in mounting queryClient provider
  // "fetching" data for it to save it in cache
  // checking the core api for what is in store
  // then running the mutation
  // and checking cache state
  // https://tanstack.com/query/latest/docs/framework/react/guides/testing
});

describe('updateBookStatus', () => {
  it('omits update - given current & previous states are same', async () => {
    const { updateBookStatus } = renderTestedHook();

    await updateBookStatus({
      bookshelfId: 'id',
      updated: ReadingStatus.finished,
      current: ReadingStatus.finished,
    });

    expect(updateUserBookMock.mutateAsync).not.toHaveBeenCalled();
  });

  it('updates book status', async () => {
    const { updateBookStatus } = renderTestedHook();

    const updated = ReadingStatus.toRead;

    await updateBookStatus({
      bookshelfId: 'id',
      updated,
      current: ReadingStatus.finished,
    });

    expect(updateUserBookMock.mutateAsync).toHaveBeenCalledWith({
      userBookId: testBookId,
      status: updated,
    });
  });

  it('invalidates cache', async () => {
    const { updateBookStatus } = renderTestedHook();

    const updated = ReadingStatus.toRead;

    await updateBookStatus({
      bookshelfId: 'id',
      updated,
      current: ReadingStatus.finished,
    });

    expect(queryClientMock.invalidateQueries).toHaveBeenCalled();
  });
});
