import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type ApplyBookChangeRequestPathParams } from '@common/contracts';

import { invalidateUserBooksByBookshelfIdQuery } from '../../../../../book/api/user/queries/findUserBooksByBookshelfId/findUserBooksByBookshelfIdQueryOptions';
import { invalidateAllFindUserBookByIdQueryPredicate } from '../../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../../../../book/api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { invalidateBookChangeRequestByIdQueryPredicate } from '../../queries/findBookChangeRequestById/findBookChangeRequestByIdQueryOptions';
import { invalidateBookChangeRequestsQueryPredicate } from '../../queries/findBookChangeRequests/findBookChangeRequestsQueryOptions';
import { invalidateAllFindBookByIdQueryPredicate } from '../../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na zaaplikowanie prośby zmiany.`,
});

const applyBookChangeRequest = async (payload: ApplyBookChangeRequestPathParams) => {
  await api.post(`/admin/book-change-requests/${payload.bookChangeRequestId}/apply`, payload, {
    errorCtor: BookApiError,
    mapper,
  });
};

export const useApplyBookChangeRequestMutation = (
  options: UseMutationOptions<void, ApiError, ApplyBookChangeRequestPathParams>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: applyBookChangeRequest,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => invalidateBookChangeRequestsQueryPredicate(queryKey),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            // Todo: add new books invalidation stuff here once done.
            invalidateBookChangeRequestByIdQueryPredicate(queryKey, args[1].bookChangeRequestId),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => invalidateUserBooksByBookshelfIdQuery({}, queryKey),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => invalidateFindUserBooksByQuery({}, queryKey),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            invalidateAllFindUserBookByIdQueryPredicate(queryKey) || invalidateFindUserBooksByQuery({}, queryKey, true),
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => invalidateAllFindBookByIdQueryPredicate(queryKey),
        }),
      ]);
    },
  });
};
