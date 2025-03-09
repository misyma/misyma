import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { type LoginUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../user/errors/userApiError';

type SendResetPasswordEmailPayload = {
  email: string;
};

const mapper = new ErrorCodeMessageMapper({
  400: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.',
});

const sendResetPasswordEmail = async (values: SendResetPasswordEmailPayload) => {
  const sendResetPasswordEmailResponse = await api.post<LoginUserResponseBody>(ApiPaths.users.resetPassword.path, {
    email: values.email,
  });

  if (api.isErrorResponse(sendResetPasswordEmailResponse)) {
    throw new UserApiError({
      message: mapper.map(sendResetPasswordEmailResponse.status),
      apiResponseError: sendResetPasswordEmailResponse.data.context,
      statusCode: sendResetPasswordEmailResponse.status,
    });
  }

  return sendResetPasswordEmailResponse.data;
};

export const useSendResetPasswordEmailMutation = (
  options: UseMutationOptions<LoginUserResponseBody, UserApiError, SendResetPasswordEmailPayload>,
) => {
  return useMutation({
    mutationFn: sendResetPasswordEmail,
    ...options,
  });
};
