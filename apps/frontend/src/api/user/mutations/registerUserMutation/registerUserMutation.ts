import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';
import { HttpService } from '../../../../modules/core/services/httpService/httpService';

export const useRegisterUserMutation = (
  options: UseMutationOptions<boolean, UserApiError, { email: string; password: string; name: string }>,
) => {
  const registerUser = async (values: { email: string; password: string; name: string }) => {
    const registerUserResponse = await HttpService.post({
      url: '/users/register',
      body: {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (registerUserResponse.success === false) {
      throw new UserApiError({
        message: mapStatusCodeToErrorMessage(registerUserResponse.statusCode),
        apiResponseError: registerUserResponse.body.context,
        statusCode: registerUserResponse.statusCode,
      });
    }

    return true;
  };

  return useMutation({
    mutationFn: registerUser,
    ...options,
  });
};

const mapStatusCodeToErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return 'Email lub hasło niepoprawne.';
    case 409:
      return 'Użytkownik z tym adresem email już istnieje.';
    case 500:
      return 'Internal server error';
    default:
      return 'Unknown error';
  }
};
