import { CreateBorrowingResponseBody, UpdateBorrowingPathParams, UpdateBorrowingRequestBody, UpdateBorrowingResponseBody } from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { BookApiError } from '../../../../book/errors/bookApiError';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';

export interface UseUpdateBorrowingMutationPayload extends UpdateBorrowingRequestBody, UpdateBorrowingPathParams {
  accessToken: string;
  userBookId: string;
}

export const useUpdateBorrowingMutation = (
  options: UseMutationOptions<CreateBorrowingResponseBody, BookApiError, UseUpdateBorrowingMutationPayload>,
) => {
  const updateBorrowing = async (payload: UseUpdateBorrowingMutationPayload) => {
    const { accessToken, userBookId, borrowingId, ...rest } = payload;

    const mapper = new ErrorCodeMessageMapper({
      400: 'Podano błędne dane.',
      403: 'Brak pozwolenia na zaaktualizowanie wypożyczenia książki.',
      500: 'Wewnętrzny błąd serwera.',
    });

    const response = await HttpService.patch<UpdateBorrowingResponseBody>({
      url: `/user-books/${userBookId}/borrowings/${borrowingId}`,
      body: rest,
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

  return useErrorHandledMutation({
    mutationFn: updateBorrowing,
    ...options,
  });
};
