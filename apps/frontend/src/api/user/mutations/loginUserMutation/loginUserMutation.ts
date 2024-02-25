import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';
import { LoginUserResponseBody } from '@common/contracts';

export const useLoginUserMutation = (
  options: UseMutationOptions<LoginUserResponseBody, UserApiError, { email: string; password: string }>,
) => {
  const loginUser = async (values: { email: string; password: string }) => {
    const loginUserResponse = await fetch('http://localhost:5000/api/users/login', {
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (loginUserResponse.status !== 200) {
      const message = mapStatusCodeToErrorMessage(loginUserResponse.status);

      const responseBody = await loginUserResponse.json();

      throw new UserApiError({
        message,
        apiResponseError: responseBody,
        statusCode: loginUserResponse.status,
      });
    }

    const loginUserResponseBody = (await loginUserResponse.json()) as LoginUserResponseBody;

    const { refreshToken, accessToken, expiresIn } = loginUserResponseBody;

    return {
      refreshToken,
      accessToken,
      expiresIn,
    };
  };

  return useMutation({
    mutationFn: loginUser,
    ...options,
  });
};

const mapStatusCodeToErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return 'Email or password are invalid.';
    case 500:
      return 'Internal server error';
    default:
      return 'Unknown error';
  }
};
