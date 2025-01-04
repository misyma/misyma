import { type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookRequestBody, type CreateBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../errors/bookApiError';

export interface UseCreateBookMutationPayload extends CreateBookRequestBody {
  accessToken: string;
}

export const useCreateBookMutation = (
  options: UseMutationOptions<CreateBookResponseBody, BookApiError, UseCreateBookMutationPayload>,
) => {
  const createBook = async (payload: UseCreateBookMutationPayload) => {
    const { accessToken, ...body } = payload;

    const mapper = new ErrorCodeMessageMapper({
      400: 'Podano błędne dane.',
      403: 'Brak pozwolenia na stworzenie książki.',
      409: 'Książka już istnieje.',
      500: 'Wewnętrzny błąd serwera.',
    });

    const response = await HttpService.post<CreateBookResponseBody>({
      url: '/books',
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

  return useErrorHandledMutation({
    mutationFn: createBook,
    ...options,
  });
};
