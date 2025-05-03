import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type UpdateBookPathParams, type UpdateBookRequestBody, type UpdateBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../../user/queries/bookApiQueryKeys';

export interface UpdateBookPayload extends UpdateBookPathParams, UpdateBookRequestBody {
  isApproved?: boolean;
}

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na zaaktualizowanie książki.`,
});

const deleteBook = async (payload: UpdateBookPayload) => {
  const response = await api.patch<UpdateBookResponseBody>(`/admin/books/${payload.bookId}`, payload, {
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const useUpdateBookMutation = (
  options: UseMutationOptions<UpdateBookResponseBody, ApiError, UpdateBookPayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteBook,
    ...options,
    onSuccess: async () => {
      //todo: refactor
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooks,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooksAdmin,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey.includes(BookApiQueryKeys.findUserBookById),
        }),
      ]);
    },
  });
};
