import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookChangeRequestRequestBody, type CreateBookshelfResponseBody } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { invalidateBookChangeRequestsQueryPredicate } from '../../../admin/queries/findBookChangeRequests/findBookChangeRequestsQueryOptions';

export interface CreateBookChangeRequestPayload extends CreateBookChangeRequestRequestBody {
  accessToken: string;
}

const mapper = new ErrorCodeMessageMapper({});

const createBookChangeRequest = async (payload: CreateBookChangeRequestRequestBody) => {
  const requestBody = Object.entries(payload).reduce(
    (filteredPayload, [key, value]) => {
      if (value === '') {
        return filteredPayload;
      }

      filteredPayload[key as string] = value;

      return filteredPayload;
    },
    {} as Record<string, unknown>,
  );

  const response = await api.post<CreateBookshelfResponseBody>('/book-change-requests', requestBody);

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const useCreateBookChangeRequestMutation = (
  options: UseMutationOptions<CreateBookshelfResponseBody, BookApiError, CreateBookChangeRequestPayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: createBookChangeRequest,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateBookChangeRequestsQueryPredicate(queryKey),
      });
    },
  });
};
