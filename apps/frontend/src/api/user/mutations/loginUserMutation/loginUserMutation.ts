import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';
import { type LoginUserResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ApiError } from '../../../../common/errors/apiError';

export const useLoginUserMutation = (
  options: UseMutationOptions<LoginUserResponseBody, UserApiError, { email: string; password: string }>,
) => {
  const loginUser = async (values: { email: string; password: string }) => {

    try {
      const loginUserResponse = await HttpService.post<LoginUserResponseBody>({
        url: '/users/login',
        body: {
          email: values.email,
          password: values.password,
        }
      });

      return loginUserResponse as LoginUserResponseBody;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new UserApiError({
          message: mapStatusCodeToErrorMessage(error.context.statusCode),
          apiResponseError: error.context.apiResponseError,
          statusCode: error.context.statusCode,
        });
      }

      throw error;
    }
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
