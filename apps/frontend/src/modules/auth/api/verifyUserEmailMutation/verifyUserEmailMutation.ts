import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { AuthApiError } from '../../errors/authApiError/authApiError';

type VerifyUserEmailPayload = {
  token: string;
};

const verifyUserEmail = async (values: VerifyUserEmailPayload) => {
  const { token } = values;

  const verifyEmailResponse = await api.post(ApiPaths.users.verifyEmail.path, {
    token,
  });

  if (api.isErrorResponse(verifyEmailResponse)) {
    throw new AuthApiError({
      message: verifyEmailResponse.data.message,
      apiResponseError: verifyEmailResponse.data.context,
      statusCode: verifyEmailResponse.status,
    });
  }

  return true;
};

export const useVerifyUserEmailMutation = (
  options: UseMutationOptions<boolean, AuthApiError, VerifyUserEmailPayload>,
) => {
  return useMutation({
    mutationFn: verifyUserEmail,
    ...options,
  });
};
