import { type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteBookChangeRequestPathParams } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';

interface Payload extends DeleteBookChangeRequestPathParams {
  accessToken: string | undefined;
}

export const useDeleteBookChangeRequestMutation = (options: UseMutationOptions<void, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na usunięcie prośby zmiany.`,
  });

  const deleteBook = async (payload: Payload) => {
    const response = await HttpService.delete({
      url: `/admin/book-change-requests/${payload.bookChangeRequestId}`,
      body: payload as unknown as Record<string, unknown>,
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
    mutationFn: deleteBook,
    ...options,
  });
};
