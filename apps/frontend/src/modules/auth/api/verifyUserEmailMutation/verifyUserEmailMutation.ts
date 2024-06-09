import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { HttpService } from '../../../../modules/core/services/httpService/httpService';
import { AuthApiError } from '../../errors/authApiError/authApiError';

export const useVerifyUserEmailMutation = (
  options: UseMutationOptions<
    boolean,
    AuthApiError,
    {
      token: string;
    }
  >,
) => {
  const verifyUserEmail = async (values: { token: string }) => {
    const { token } = values;

    const verifyEmailResponse = await HttpService.post({
      url: '/users/verify-email',
      body: {
        token,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (verifyEmailResponse.success === false) {
      throw new AuthApiError({
        message: verifyEmailResponse.body.message,
        apiResponseError: verifyEmailResponse.body.context,
        statusCode: verifyEmailResponse.statusCode,
      });
    }

    return true;
  };

  return useMutation({
    mutationFn: verifyUserEmail,
    ...options,
  });
};
