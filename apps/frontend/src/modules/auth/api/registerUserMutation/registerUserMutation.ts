import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../user/errors/userApiError';

const mapper = new ErrorCodeMessageMapper({
  400: 'Email lub hasło niepoprawne.',
  409: 'Użytkownik z tym adresem email już istnieje.',
});

const registerUser = async (values: { email: string; password: string; name: string }) => {
  const registerUserResponse = await api.post(ApiPaths.users.register.path, {
    email: values.email,
    password: values.password,
    name: values.name,
  });

  if (api.isErrorResponse(registerUserResponse)) {
    throw new UserApiError({
      message: mapper.map(registerUserResponse.status),
      apiResponseError: registerUserResponse.data.context,
      statusCode: registerUserResponse.status,
    });
  }

  return true;
};

export const useRegisterUserMutation = (
  options: UseMutationOptions<boolean, UserApiError, { email: string; password: string; name: string }>,
) => {
  return useMutation({
    mutationFn: registerUser,
    ...options,
  });
};
