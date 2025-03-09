import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteQuotePathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { QuoteApiError } from '../../errors/quoteApiError';
import { invalidateQuotesQueries } from '../../queries/getQuotes/getQuotes';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie cytatu.`,
});

type Payload = DeleteQuotePathParams & {
  userBookId: string;
};

const deleteQuote = async (payload: Payload) => {
  const response = await api.delete(`/quotes/${payload.quoteId}`);

  api.validateResponse(response, QuoteApiError, mapper);
};

export const useDeleteQuoteMutation = (options: UseMutationOptions<void, QuoteApiError, Payload>) => {
  const queryClient = useQueryClient();

  return useErrorHandledMutation({
    mutationFn: deleteQuote,
    ...options,
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateQuotesQueries(queryKey, vars.userBookId),
      });
    },
  });
};
