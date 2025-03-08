import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteQuotePathParams } from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { invalidateQuotesQueries } from '../../queries/getQuotes/getQuotes';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie cytatu.`,
});

type Payload = DeleteQuotePathParams & {
  userBookId: string;
};

const deleteQuote = async (payload: Payload) => {
  const response = await api.delete(`/quotes/${payload.quoteId}`);

  if (api.isErrorResponse(response)) {
    // todo: quote api error
    throw new BookApiError({
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return;
};

export const useDeleteQuoteMutation = (options: UseMutationOptions<void, ApiError, Payload>) => {
  const queryClient = useQueryClient();

  return useErrorHandledMutation({
    mutationFn: deleteQuote,
    ...options,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateQuotesQueries(queryKey, vars.userBookId),
      });
    },
  });
};
