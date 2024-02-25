import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';

export const useRegisterUserMutation = (
  options: UseMutationOptions<boolean, UserApiError, { email: string; password: string; name: string }>,
) => {
  const registerUser = async (values: { email: string; password: string; name: string }) => {
    const registerUserResponse = await fetch('https://api.misyma.com/api/users/register', {
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        name: 'Maciej', // TODO: Remove hardcoded name
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (registerUserResponse.status !== 201) {
      const message = mapStatusCodeToErrorMessage(registerUserResponse.status);

      const responseBody = await registerUserResponse.json();

      throw new UserApiError({
        message,
        apiResponseError: responseBody,
        statusCode: registerUserResponse.status,
      });
    }

    return registerUserResponse.status === 201;
  };

  return useMutation({
    mutationFn: registerUser,
    ...options
  })
};


const mapStatusCodeToErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return 'Email or password are invalid.';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 409:
      return 'User with this email address already exists.';
    case 500:
      return 'Internal server error';
    default:
      return 'Unknown error';
  }
}