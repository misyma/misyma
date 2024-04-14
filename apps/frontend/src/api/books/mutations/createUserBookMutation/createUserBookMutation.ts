import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { CreateUserBookRequestBody, CreateUserBookResponseBody } from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError';
import { HttpService } from '../../../../core/services/httpService/httpService';

type Payload = CreateUserBookRequestBody & {
  userId: string;
};

export const useCreateUserBookMutation = (
  options: UseMutationOptions<CreateUserBookResponseBody, BookApiError, CreateUserBookRequestBody>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const createUserBook = async (payload: Payload) => {
    const response = await HttpService.post<CreateUserBookResponseBody>({
      url: `/users/${payload.userId}/books`,
      body: payload as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: mapErrorCodeToErrorMessage(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useMutation({
    mutationFn: createUserBook,
    ...options,
  });
};

const mapErrorCodeToErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return `Podano błędne dane.`;

    case 403:
      return `Brak pozwolenia na stworzenie książki.`;

    case 500:
      return `Wewnętrzny błąd serwera.`;

    default:
      return 'Nieznany błąd.';
  }
};
