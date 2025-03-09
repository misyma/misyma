import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { AuthApiError } from '../../errors/authApiError/authApiError';

type VerifyUserEmailPayload = {
  token: string;
};

const mapper = new ErrorCodeMessageMapper({});

const verifyUserEmail = async (values: VerifyUserEmailPayload) => {
  const { token } = values;

  const verifyEmailResponse = await api.post(ApiPaths.users.verifyEmail.path, {
    token,
  });

  api.validateResponse(verifyEmailResponse, AuthApiError, mapper);

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
