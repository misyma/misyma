import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { CreateBookRequestBody, CreateBookResponseBody } from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError';
import { HttpService } from '../../../../core/services/httpService/httpService';

export const useCreateBookMutation = (
  options: UseMutationOptions<CreateBookResponseBody, BookApiError, CreateBookRequestBody>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const createBook = async (payload: CreateBookRequestBody) => {
    const response = await HttpService.post<CreateBookResponseBody>({
      url: '/books',
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
    mutationFn: createBook,
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
