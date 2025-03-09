import { type UseMutationOptions } from '@tanstack/react-query';

import { type LoginUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { AuthApiError } from '../../errors/authApiError/authApiError';

const mapper = new ErrorCodeMessageMapper({
  400: 'Email lub hasło niepoprawne.',
  401: 'Email lub hasło niepoprawne.',
  403: 'Email nie został zweryfikowany',
});

const loginUser = async (values: { email: string; password: string }) => {
  const loginUserResponse = await api.post<LoginUserResponseBody>(ApiPaths.users.login.path, {
    email: values.email,
    password: values.password,
  });

  if (api.isErrorResponse(loginUserResponse)) {
    throw new AuthApiError({
      message: mapper.map(loginUserResponse.status),
      apiResponseError: loginUserResponse.data.context,
      statusCode: loginUserResponse.status,
    });
  }

  return loginUserResponse.data;
};

export const useLoginUserMutation = (
  options: UseMutationOptions<LoginUserResponseBody, AuthApiError, { email: string; password: string }>,
) => {
  return useErrorHandledMutation({
    mutationFn: loginUser,
    ...options,
  });
};
