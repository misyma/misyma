import { UseMutationOptions } from '@tanstack/react-query';
import { CreateUserBookRequestBody, CreateUserBookResponseBody } from '@common/contracts';
import { BookApiError } from '../../../../errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ExtendedTPayload, useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

export interface CreateUserBookMutationPayload extends CreateUserBookRequestBody {
  accessToken: string;
}

export const useCreateUserBookMutation = (
  options: UseMutationOptions<CreateUserBookResponseBody, BookApiError, ExtendedTPayload<CreateUserBookMutationPayload>>,
) => {
  const mapper = new ErrorCodeMessageMapper({
    400: 'Podano błędne dane.',
    403: 'Brak pozwolenia na stworzenie książki.',
    409: 'Książka z podanym isbn już istnieje na jednej z Twoich półek.',
    500: 'Wewnętrzny błąd serwera.',
  });

  const createUserBook = async (payload: CreateUserBookMutationPayload) => {
    const { accessToken, ...body } = payload;

    const response = await HttpService.post<CreateUserBookResponseBody>({
      url: '/user-books',
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
    mutationFn: createUserBook,
    ...options,
  });
};
