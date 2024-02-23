import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';

export const useVerifyUserEmailMutation = (
  options: UseMutationOptions<
    boolean,
    UserApiError,
    {
      token: string;
    }
  >,
) => {
  const verifyUserEmail = async (values: { token: string }) => {
    const { token } = values;

    const verifyEmailResponse = await fetch('http://localhost:5000/api/users/verify-email', {
      body: JSON.stringify({
        token,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (verifyEmailResponse.status !== 200) {
      const responseBody = await verifyEmailResponse.json();

      throw new UserApiError({
        message: responseBody.message,
        apiResponseError: responseBody,
      });
    }

    return true;
  };

  return useMutation({
    mutationFn: verifyUserEmail,
    ...options
  })
};
