import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteUserBookPathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../queries/bookApiQueryKeys';
import { invalidateFindUserBooksByQuery } from '../../queries/findUserBookBy/findUserBooksByQueryOptions';

const mapper = new ErrorCodeMessageMapper({});

type Payload = DeleteUserBookPathParams & {
  bookshelfId: string;
};

export const deleteUserBook = async (payload: Payload) => {
  const { userBookId } = payload;

  const response = await api.delete(`/user-books/${userBookId}`);

  api.validateResponse(response, BookApiError, mapper);
};

export const useDeleteUserBookMutation = (options: UseMutationOptions<void, Error, Payload>) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteUserBook,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }

      // todo: refactor
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBookById && query.queryKey[1] === args[1].userBookId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === args[1].bookshelfId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findUserBooksBy &&
            query.queryKey[1] === args[1].bookshelfId &&
            query.queryKey.includes('infinite-query'),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => invalidateFindUserBooksByQuery({}, queryKey, true),
        }),
      ]);
    },
  });
};
