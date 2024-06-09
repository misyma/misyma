import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { CreateBookRequestBody, CreateBookResponseBody } from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';

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

  return useMutation({
    mutationFn: createBook,
    ...options,
  });
};
