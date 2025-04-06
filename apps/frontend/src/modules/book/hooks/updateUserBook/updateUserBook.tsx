import { useQueryClient } from '@tanstack/react-query';

import { SortOrder, type ReadingStatus } from '@common/contracts';

import { useUpdateBorrowingMutation } from '../../../borrowing/api/mutations/updateBorrowingMutation/updateBorrowingMutation';
import { FindBookBorrowingsQueryOptions } from '../../../borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { useToast } from '../../../common/components/toast/use-toast';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { useUploadBookImageMutation } from '../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { invalidateUserBooksByBookshelfIdQuery } from '../../api/user/queries/findUserBooksByBookshelfId/findUserBooksByBookshelfIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { invalidateFindUserBookByIdQueryPredicate } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useRef } from 'react';

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
  image: File;
}

export const useUpdateUserBook = (id: string) => {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const { mutateAsync: updateUserBook, isPending: isUpdatePending } = useUpdateUserBookMutation({});
  const { mutateAsync: updateBorrowing } = useUpdateBorrowingMutation({});
  const { mutateAsync: uploadBookImageMutation, isPending: isImageUploadPending } = useUploadBookImageMutation({});
  const retries = useRef(0);

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
        predicate: ({ queryKey }) => invalidateFindUserBookByIdQueryPredicate(queryKey, id),
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateUserBooksByBookshelfIdQuery(
            {
              bookshelfId,
            },
            queryKey,
          ),
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateFindUserBooksByQuery({}, queryKey, true),
      }),
    ]);
  };

  const updateBookBookshelf = async (payload: UpdateBookBookshelfPayload) => {
    const invalidateBooksByBookshelfQueries = () => {
      return [
        queryClient.invalidateQueries({
          predicate: (query) =>
            invalidateUserBooksByBookshelfIdQuery(
              {
                bookshelfId: id,
              },
              query.queryKey,
            ),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            invalidateUserBooksByBookshelfIdQuery(
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
          predicate: ({ queryKey }) =>
            invalidateFindUserBooksByQuery(
              {
                bookshelfId: currentBookshelfId,
              },
              queryKey,
            ),
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

    const { currentBookshelfId, bookshelfId, borrowingBookshelfId, previousBookshelfName, bookshelfName } = payload;

    if (isLoadingBorrowing && retries.current < 2 && previousBookshelfName === 'Wypożyczalnia') {
      retries.current += 1;

      return await new Promise<void>((res) =>
        setTimeout(() => {
          updateBookBookshelf(payload).then(() => {
            res();
            retries.current = 0;
          });
        }, 100),
      );
    }

    if (isLoadingBorrowing && retries.current >= 2 && previousBookshelfName === 'Wypożyczalnia') {
      toast({
        title: 'Nie udało się zmienić półki.',
        description: 'Spróbuj ponownie.',
        variant: 'destructive',
      });
      return;
    }

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
    await uploadBookImageMutation({
      bookId: id,
      file: payload.image as unknown as File,
    });
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
