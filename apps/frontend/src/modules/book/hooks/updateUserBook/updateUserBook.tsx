import { useQueryClient } from '@tanstack/react-query';

import { SortOrder, type ReadingStatus } from '@common/contracts';

import { useUpdateBorrowingMutation } from '../../../borrowing/api/mutations/updateBorrowingMutation/updateBorrowingMutation';
import { FindBookBorrowingsQueryOptions } from '../../../borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { toast } from '../../../common/components/toast/use-toast';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { useUploadBookImageMutation } from '../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { invalidateBooksByBookshelfIdQuery } from '../../api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';

interface UpdateBookStatusPayload {
  current?: ReadingStatus;
  updated: ReadingStatus;
  bookshelfId: string;
}

interface UpdateBookBookshelfPayload {
  currentBookshelfId: string;
  bookshelfId: string;
  borrowingBookshelfId?: string;
  previousBookshelfName: string | null;
  bookshelfName: string;
}

interface UpdatePayload {
  image?: File;
  genre?: string;
}

export const useUpdateUserBook = (id: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUserBook, isPending: isUpdatePending } = useUpdateUserBookMutation({});
  const { mutateAsync: updateBorrowing } = useUpdateBorrowingMutation({});
  const { mutateAsync: uploadBookImageMutation, isPending: isImageUploadPending } = useUploadBookImageMutation({});

  const { data: bookBorrowing, isLoading: isLoadingBorrowing } = useErrorHandledQuery(
    FindBookBorrowingsQueryOptions({
      userBookId: id,
      page: 1,
      pageSize: 1,
      sortDate: SortOrder.desc,
      isOpen: true,
    }),
  );

  const updateBookStatus = async (payload: UpdateBookStatusPayload) => {
    const { current, bookshelfId, updated } = payload;
    if (current === updated) {
      return;
    }

    await updateUserBook({
      userBookId: id,
      status: updated,
    });

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [BookApiQueryKeys.findUserBookById, id],
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === bookshelfId,
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findUserBooksBy && query.queryKey.includes('infinite-query'),
      }),
    ]);
  };

  const updateBookBookshelf = async (payload: UpdateBookBookshelfPayload) => {
    const invalidateBooksByBookshelfQueries = () => {
      return [
        queryClient.invalidateQueries({
          predicate: (query) =>
            invalidateBooksByBookshelfIdQuery(
              {
                bookshelfId: id,
              },
              query.queryKey,
            ),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            invalidateBooksByBookshelfIdQuery(
              {
                bookshelfId: currentBookshelfId,
              },
              queryKey,
            ),
        }),
      ];
    };
    const invalidateBooksByXQueries = () => {
      return [
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findUserBooksBy && query.queryKey[1] === currentBookshelfId,
        }),
        borrowingBookshelfId
          ? queryClient.invalidateQueries({
              predicate: ({ queryKey }) =>
                invalidateFindUserBooksByQuery(
                  {
                    bookshelfId: id,
                  },
                  queryKey,
                ),
            })
          : Promise.resolve(),
      ];
    };

    if (isLoadingBorrowing) {
      return;
    }
    const { currentBookshelfId, bookshelfId, borrowingBookshelfId, previousBookshelfName, bookshelfName } = payload;

    await updateUserBook({
      userBookId: id,
      bookshelfId,
    });

    if (previousBookshelfName === 'Wypożyczalnia') {
      await updateBorrowing({
        borrowingId: bookBorrowing?.data?.[0]?.id as string,
        userBookId: id,
        endedAt: new Date().toISOString(),
      });
    }

    toast({
      title: `Zmieniono półkę.`,
      description: `Książka znajduje się teraz na: ${bookshelfName}`,
      variant: 'success',
    });

    await Promise.all([...invalidateBooksByBookshelfQueries(), ...invalidateBooksByXQueries()]);
  };

  const setFavorite = async (favorite: boolean) => {
    await updateUserBook({
      userBookId: id,
      isFavorite: favorite,
    });
  };

  const update = async (payload: UpdatePayload) => {
    if (payload.image) {
      await uploadBookImageMutation({
        bookId: id,
        file: payload.image as unknown as File,
      });
    }

    if (payload.genre) {
      await updateUserBook({
        userBookId: id,
        genreId: payload.genre,
      });
    }
  };

  return {
    update,
    updateBookStatus,
    updateBookBookshelf,
    setFavorite,
    isLoadingBorrowing,
    isUpdatePending,
    isImageUploadPending,
  };
};
