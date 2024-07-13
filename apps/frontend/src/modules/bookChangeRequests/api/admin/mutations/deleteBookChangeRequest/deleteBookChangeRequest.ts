import { DeleteBookChangeRequestPathParams } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { BookApiError } from '../../../../../book/errors/bookApiError';

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

  return useMutation({
    mutationFn: deleteBook,
    ...options,
  });
};
