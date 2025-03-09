import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../user/errors/userApiError';

type SendVerificationEmailPayload = {
  email: string;
};

const sendVerificationEmail = async (values: SendVerificationEmailPayload) => {
  const { email } = values;

  const sendVerificationEmailResponse = await api.post(ApiPaths.users.sendVerificationEmail.path, {
    email,
  });

  if (api.isErrorResponse(sendVerificationEmailResponse)) {
    throw new UserApiError({
      message: sendVerificationEmailResponse.data.message,
      apiResponseError: sendVerificationEmailResponse.data.context,
      statusCode: sendVerificationEmailResponse.status,
    });
  }

  return;
};

export const useSendVerificationEmailMutation = (
  options: UseMutationOptions<void, UserApiError, SendVerificationEmailPayload>,
) => {
  return useMutation({
    mutationFn: sendVerificationEmail,
    ...options,
  });
};
