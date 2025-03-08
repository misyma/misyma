import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteBookChangeRequestPathParams } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { invalidateBookChangeRequestByIdQueryPredicate } from '../../queries/findBookChangeRequestById/findBookChangeRequestByIdQueryOptions';
import { invalidateBookChangeRequestsQueryPredicate } from '../../queries/findBookChangeRequests/findBookChangeRequestsQueryOptions';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie prośby zmiany.`,
});

const deleteBookChangeRequest = async (payload: DeleteBookChangeRequestPathParams) => {
  const response = await api.delete(`/admin/book-change-requests/${payload.bookChangeRequestId}`);

  if (api.isErrorResponse(response)) {
    throw new BookApiError({
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return;
};

export const useDeleteBookChangeRequestMutation = (
  options: UseMutationOptions<void, ApiError, DeleteBookChangeRequestPathParams>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteBookChangeRequest,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateBookChangeRequestsQueryPredicate(queryKey) ||
          invalidateBookChangeRequestByIdQueryPredicate(queryKey, args[1].bookChangeRequestId),
      });
    },
  });
};
