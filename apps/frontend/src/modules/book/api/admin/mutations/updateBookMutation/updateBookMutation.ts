import { UpdateBookPathParams, UpdateBookRequestBody, UpdateBookResponseBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { BookApiError } from '../../../../errors/bookApiError';

interface Payload extends UpdateBookPathParams, UpdateBookRequestBody {
  accessToken: string | undefined;
  isApproved?: boolean;
}

export const useUpdateBookMutation = (options: UseMutationOptions<UpdateBookResponseBody, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na zaaktualizowanie książki.`,
  });

  const deleteBook = async (payload: Payload) => {
    const { accessToken, ...body } = payload;

    const response = await HttpService.patch<UpdateBookResponseBody>({
      url: `/admin/books/${payload.bookId}`,
      body: body as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useMutation({
    mutationFn: deleteBook,
    ...options,
  });
};
