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
  await api.post(
    ApiPaths.users.register.path,
    {
      email: values.email,
      password: values.password,
      name: values.name,
    },
    {
      errorCtor: UserApiError,
      mapper,
    },
  );

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
