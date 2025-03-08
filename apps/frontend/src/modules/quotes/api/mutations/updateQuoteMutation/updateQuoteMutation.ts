import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateQuotePathParams,
  type UpdateQuoteRequestBody,
  type UpdateQuoteResponseBody,
} from '@common/contracts';

import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { invalidateInfiniteQuotesPredicate, invalidateQuotesPredicate } from '../../queries/getQuotes/getQuotes';

export interface UpdateQuotePayload extends UpdateQuotePathParams, UpdateQuoteRequestBody {}
export const updateQuote = async (payload: UpdateQuotePayload) => {
  const { quoteId, ...body } = payload;

  if (body.content === '') {
    delete body.content;
  }

  const path = ApiPaths.quotes.$quoteId.path;
  const resolvedPath = path.replace(ApiPaths.quotes.$quoteId.params.quoteId, quoteId);
  const response = await api.patch<UpdateQuoteResponseBody>(resolvedPath, body);

  if (api.isErrorResponse(response)) {
    throw new Error(response.data.message); //todo: dedicated errors
  }

  return response.data;
};

export const useUpdateQuoteMutation = (
  options: UseMutationOptions<UpdateQuoteResponseBody, Error, UpdateQuotePayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: updateQuote,
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateQuotesPredicate(queryKey, data.userBookId) || invalidateInfiniteQuotesPredicate(queryKey),
      });
    },
  });
};
