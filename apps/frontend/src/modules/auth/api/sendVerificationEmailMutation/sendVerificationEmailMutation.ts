import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { ErrorCodeMessageMapper } from '../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../user/errors/userApiError';

type SendVerificationEmailPayload = {
  email: string;
};

const mapper = new ErrorCodeMessageMapper({});

const sendVerificationEmail = async (values: SendVerificationEmailPayload) => {
  const { email } = values;

  await api.post(
    ApiPaths.users.sendVerificationEmail.path,
    {
      email,
    },
    {
      errorCtor: UserApiError,
      mapper,
    },
  );
};

export const useSendVerificationEmailMutation = (
  options: UseMutationOptions<void, UserApiError, SendVerificationEmailPayload>,
) => {
  return useMutation({
    mutationFn: sendVerificationEmail,
    ...options,
  });
};
