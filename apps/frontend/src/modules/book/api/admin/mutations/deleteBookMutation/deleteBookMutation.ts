import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteBookPathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../../user/queries/bookApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie książki.`,
});

const deleteBook = async (payload: DeleteBookPathParams) => {
  const response = await api.delete(`/admin/books/${payload.bookId}`);

  if (api.isErrorResponse(response)) {
    throw new BookApiError({
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return;
};

export const useDeleteBookMutation = (options: UseMutationOptions<void, ApiError, DeleteBookPathParams>) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteBook,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      // todo: refactor
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBookById && query.queryKey[1] === args[1].bookId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
        }),
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId,
        }),
      ]);
    },
  });
};
