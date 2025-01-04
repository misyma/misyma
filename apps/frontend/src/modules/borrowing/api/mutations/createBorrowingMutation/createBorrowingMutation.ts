import { type UseMutationOptions } from '@tanstack/react-query';

import {
  type CreateBorrowingPathParams,
  type CreateBorrowingRequestBody,
  type CreateBorrowingResponseBody,
} from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../core/services/httpService/httpService';

export interface UseCreateBorrowingMutationPayload extends CreateBorrowingRequestBody, CreateBorrowingPathParams {
  accessToken: string;
}

export const useCreateBorrowingMutation = (
  options: UseMutationOptions<CreateBorrowingResponseBody, BookApiError, UseCreateBorrowingMutationPayload>,
) => {
  const createBorrowing = async (payload: UseCreateBorrowingMutationPayload) => {
    const { accessToken, userBookId, ...rest } = payload;

    const mapper = new ErrorCodeMessageMapper({
      400: 'Podano błędne dane.',
      403: 'Brak pozwolenia na stworzenie wypożyczenia książki.',
      500: 'Wewnętrzny błąd serwera.',
    });

    const response = await HttpService.post<CreateBorrowingResponseBody>({
      url: `/user-books/${userBookId}/borrowings`,
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
    mutationFn: createBorrowing,
    ...options,
  });
};
