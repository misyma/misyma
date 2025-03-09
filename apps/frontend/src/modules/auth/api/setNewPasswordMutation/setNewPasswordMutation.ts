import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { type LoginUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../user/errors/userApiError';

const mapper = new ErrorCodeMessageMapper({
  400: 'Nie udało się ustawić nowego hasła. Spróbuj ponownie.',
});

const setNewPassword = async (values: { password: string; token: string }) => {
  const setNewPasswordResponse = await api.post<LoginUserResponseBody>(ApiPaths.users.changePassword.path, {
    password: values.password,
    token: values.token,
  });
  api.validateResponse(setNewPasswordResponse, UserApiError, mapper);

  return setNewPasswordResponse.data;
};

export const useSetNewPasswordMutation = (
  options: UseMutationOptions<LoginUserResponseBody, UserApiError, { token: string; password: string }>,
) => {
  return useMutation({
    mutationFn: setNewPassword,
    ...options,
  });
};
