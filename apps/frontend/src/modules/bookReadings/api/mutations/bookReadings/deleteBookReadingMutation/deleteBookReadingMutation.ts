import { type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteBookReadingPathParams } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';

interface Payload extends DeleteBookReadingPathParams {
  accessToken: string | undefined;
}

export const useDeleteBookReadingMutation = (options: UseMutationOptions<void, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na usunięcie oceny.`,
  });

  const deleteBookReading = async (payload: Payload) => {
    const response = await HttpService.delete({
      url: `/user-books/${payload.userBookId}/readings/${payload.readingId}`,
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
    mutationFn: deleteBookReading,
    ...options,
  });
};
