import { UseMutationOptions } from '@tanstack/react-query';
import { type LoginUserResponseBody } from '@common/contracts';
import { HttpService } from '../../../../modules/core/services/httpService/httpService';
import { AuthApiError } from '../../errors/authApiError/authApiError';
import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../common/hooks/useErrorHandledMutation';

export const useLoginUserMutation = (
  options: UseMutationOptions<LoginUserResponseBody, AuthApiError, { email: string; password: string }>,
) => {
  const mapper = new ErrorCodeMessageMapper({
    400: 'Email lub hasło niepoprawne.',
    401: 'Email lub hasło niepoprawne.',
    403: 'Email nie został zweryfikowany',
  });

  const loginUser = async (values: { email: string; password: string }) => {
    const loginUserResponse = await HttpService.post<LoginUserResponseBody>({
      url: '/users/login',
      body: {
        email: values.email,
        password: values.password,
      },
    });

    if (loginUserResponse.success === false) {
      throw new AuthApiError({
        message: mapper.map(loginUserResponse.statusCode),
        apiResponseError: loginUserResponse.body.context,
        statusCode: loginUserResponse.statusCode,
      });
    }

    return loginUserResponse.body;
  };

  return useErrorHandledMutation({
    mutationFn: loginUser,
    ...options,
  });
};

