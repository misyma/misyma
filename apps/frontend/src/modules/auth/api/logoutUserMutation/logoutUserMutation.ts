import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { type LogoutUserPathParams, type LogoutUserRequestBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { AuthApiError } from '../../errors/authApiError/authApiError';

type Payload = LogoutUserPathParams & LogoutUserRequestBody;

const mapper = new ErrorCodeMessageMapper({
  400: 'Niepoprawne dane',
  401: 'Niepoprawne dane',
});

const logoutUser = async (values: Payload) => {
  const { accessToken, userId, refreshToken } = values;

  let path: string = ApiPaths.users.$userId.logout.path;
  path = path.replace('{{userId}}', userId);
  const logoutUserResponse = await api.post<void>(path, {
    refreshToken,
    accessToken,
  });

  if (api.isErrorResponse(logoutUserResponse)) {
    throw new AuthApiError({
      message: mapper.map(logoutUserResponse.status),
      apiResponseError: logoutUserResponse.data.context,
      statusCode: logoutUserResponse.status,
    });
  }

  return;
};

export const useLogoutUserMutation = (options: UseMutationOptions<void, AuthApiError, Payload>) => {
  return useMutation({
    mutationFn: logoutUser,
    ...options,
  });
};
