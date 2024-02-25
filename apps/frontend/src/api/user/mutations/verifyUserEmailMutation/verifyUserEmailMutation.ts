import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ApiError } from '../../../../common/errors/apiError';

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

    try {
      await HttpService.post({
        url: '/users/verify-email',
        body: {
          token,
        },
        headers: {
          'Content-Type': 'application/json',
        }
      })

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new UserApiError({
          message: error.context.message,
          apiResponseError: error.context.apiResponseError,
          statusCode: error.context.statusCode,
        });
      }

      throw error;
    }
  };

  return useMutation({
    mutationFn: verifyUserEmail,
    ...options
  })
};
