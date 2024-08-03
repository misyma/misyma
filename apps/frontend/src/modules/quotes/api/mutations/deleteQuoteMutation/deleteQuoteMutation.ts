import { DeleteQuotePathParams } from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { BookApiError } from '../../../../book/errors/bookApiError';
import { ApiError } from '../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';

interface Payload extends DeleteQuotePathParams {
  accessToken: string | undefined;
}

export const useDeleteQuoteMutation = (options: UseMutationOptions<void, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na usunięcie książki.`,
  });

  const deleteQuote = async (payload: Payload) => {
    const response = await HttpService.delete({
      url: `/user-books/${payload.userBookId}/quotes/${payload.quoteId}`,
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return;
  };

  return useErrorHandledMutation({
    mutationFn: deleteQuote,
    ...options,
  });
};
