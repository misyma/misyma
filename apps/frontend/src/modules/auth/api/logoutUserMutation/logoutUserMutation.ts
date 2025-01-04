import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { type LogoutUserPathParams, type LogoutUserRequestBody } from '@common/contracts';

import { HttpService } from '../../../../modules/core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { AuthApiError } from '../../errors/authApiError/authApiError';

type Payload = LogoutUserPathParams & LogoutUserRequestBody;

export const useLogoutUserMutation = (options: UseMutationOptions<void, AuthApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    400: 'Niepoprawne dane',
    401: 'Niepoprawne dane',
  });

  const logoutUser = async (values: Payload) => {
    const { accessToken, userId, refreshToken } = values;

    const logoutUserResponse = await HttpService.post<void>({
      url: `/users/${userId}/logout`,
      body: {
        refreshToken,
        accessToken,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (logoutUserResponse.success === false) {
      throw new AuthApiError({
        message: mapper.map(logoutUserResponse.statusCode),
        apiResponseError: logoutUserResponse.body.context,
        statusCode: logoutUserResponse.statusCode,
      });
    }

    return;
  };

  return useMutation({
    mutationFn: logoutUser,
    ...options,
  });
};
