import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UserApiError } from '../../errors/userApiError';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ApiError } from '../../../../common/errors/apiError';

export const useRegisterUserMutation = (
  options: UseMutationOptions<boolean, UserApiError, { email: string; password: string; name: string }>,
) => {
  const registerUser = async (values: { email: string; password: string; name: string }) => {
    try {
      await HttpService.post({
        url: '/users/register',
        body: {
          email: values.email,
          password: values.password,
          name: values.name || 'Maciej', // TODO: Remove hardcoded name
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return true;
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
    mutationFn: registerUser,
    ...options
  })
};


const mapStatusCodeToErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return 'Email or password are invalid.';
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