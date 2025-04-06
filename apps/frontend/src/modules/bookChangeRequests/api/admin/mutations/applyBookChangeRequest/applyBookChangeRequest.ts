import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type ApplyBookChangeRequestPathParams } from '@common/contracts';

import { BookApiQueryKeys } from '../../../../../book/api/user/queries/bookApiQueryKeys';
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

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na zaaplikowanie prośby zmiany.`,
});

const applyBookChangeRequest = async (payload: ApplyBookChangeRequestPathParams) => {
  const response = await api.post(`/admin/book-change-requests/${payload.bookChangeRequestId}/apply`, payload);

  api.validateResponse(response, BookApiError, mapper);
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

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateBookChangeRequestsQueryPredicate(queryKey) ||
          // Todo: add new books invalidation stuff here once done.
          invalidateBookChangeRequestByIdQueryPredicate(queryKey, args[1].bookChangeRequestId) ||
          queryKey[0] === BookApiQueryKeys.findUserBookById ||
          invalidateUserBooksByBookshelfIdQuery({}, queryKey) ||
          invalidateFindUserBooksByQuery({}, queryKey) ||
          invalidateAllFindUserBookByIdQueryPredicate(queryKey) ||
          invalidateFindUserBooksByQuery({}, queryKey, true),
      });
    },
  });
};
