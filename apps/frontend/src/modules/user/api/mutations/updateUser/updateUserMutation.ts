import { type UseMutationOptions } from '@tanstack/react-query';

import { type UpdateUserRequestBody, type UpdateUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../errors/userApiError';

export interface UseUpdateUserMutationPayload extends UpdateUserRequestBody {
  userId: string;
}

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na zaaktualizowanie danych.',
  409: 'Dane zostały już nadpisane. Odśwież stronę i spróbuj jeszcze raz',
  500: 'Wewnętrzny błąd serwera.',
});

const updateUser = async (payload: UseUpdateUserMutationPayload) => {
  const { userId, ...body } = payload;

  const path = ApiPaths.users.$userId.path;
  const resolvedPath = path.replace(ApiPaths.users.$userId.pathParam.userId, userId);
  const response = await api.patch<UpdateUserResponseBody>(resolvedPath, body);

  api.validateResponse(response, UserApiError, mapper);

  return response.data;
};

export const useUpdateUserMutation = (
  options: UseMutationOptions<UpdateUserResponseBody, UserApiError, UseUpdateUserMutationPayload>,
) => {
  return useErrorHandledMutation({
    mutationFn: updateUser,
    ...options,
  });
};
