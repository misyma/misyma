import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type CreateBorrowingPathParams,
  type CreateBorrowingRequestBody,
  type CreateBorrowingResponseBody,
} from '@common/contracts';

import { BookApiQueryKeys } from '../../../../book/api/user/queries/bookApiQueryKeys';
import { invalidateUserBooksByBookshelfIdQuery } from '../../../../book/api/user/queries/findUserBooksByBookshelfId/findUserBooksByBookshelfIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../../../book/api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { BorrowingApiQueryKeys } from '../../queries/borrowingApiQueryKeys';

export interface UseCreateBorrowingMutationPayload extends CreateBorrowingRequestBody, CreateBorrowingPathParams {
  currentBookshelfId: string;
  borrowingBookshelfId: string;
}

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na stworzenie wypożyczenia książki.',
  500: 'Wewnętrzny błąd serwera.',
});

const createBorrowing = async (payload: UseCreateBorrowingMutationPayload) => {
  const { userBookId, ...rest } = payload;

  const response = await api.post<CreateBorrowingResponseBody>(`/user-books/${userBookId}/borrowings`, rest);

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const useCreateBorrowingMutation = (
  options: UseMutationOptions<CreateBorrowingResponseBody, BookApiError, UseCreateBorrowingMutationPayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: createBorrowing,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }

      //todo: refactor
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            queryKey[0] === BorrowingApiQueryKeys.findBookBorrowingsQuery && queryKey[1] === args[1].userBookId,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            queryKey.includes('infinite-query') &&
            queryKey[0] === BookApiQueryKeys.findUserBooksBy &&
            queryKey[1] === args[1].currentBookshelfId,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            queryKey[0] === BookApiQueryKeys.findUserBookById && queryKey[1] === args[1].userBookId,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            invalidateFindUserBooksByQuery(
              {
                bookshelfId: args[1].borrowingBookshelfId,
              },
              queryKey,
            ),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            invalidateUserBooksByBookshelfIdQuery(
              {
                bookshelfId: args[1].borrowingBookshelfId,
              },
              queryKey,
            ),
        }),
      ]);
    },
  });
};
