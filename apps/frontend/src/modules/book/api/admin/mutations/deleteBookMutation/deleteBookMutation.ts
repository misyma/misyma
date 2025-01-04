import { type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteBookPathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../errors/bookApiError';

interface Payload extends DeleteBookPathParams {
  accessToken: string | undefined;
}

export const useDeleteBookMutation = (options: UseMutationOptions<void, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na usunięcie książki.`,
  });

  const deleteBook = async (payload: Payload) => {
    const response = await HttpService.delete({
      url: `/admin/books/${payload.bookId}`,
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
