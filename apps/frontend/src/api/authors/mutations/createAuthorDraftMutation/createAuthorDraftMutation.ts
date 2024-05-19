import { CreateAuthorRequestBody, CreateAuthorResponseBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ApiError } from '../../../../common/errors/apiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../core/services/httpService/httpService';

export const useCreateAuthorDraftMutation = (
  options: UseMutationOptions<CreateAuthorResponseBody, ApiError, CreateAuthorRequestBody>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const createAuthor = async (payload: CreateAuthorRequestBody) => {
    const response = await HttpService.post<CreateAuthorResponseBody>({
      url: '/authors',
      body: payload as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new ApiError('Author api error.', {
        apiResponseError: response.body.context,
        message: mapErrorCodeToErrorMessage(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useMutation({
    mutationFn: createAuthor,
    ...options,
  });
};

const mapErrorCodeToErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return `Podano błędne dane.`;

    case 403:
      return `Brak pozwolenia na stworzenie autora.`;

    case 500:
      return `Wewnętrzny błąd serwera.`;

    default:
      return 'Nieznany błąd.';
  }
};
