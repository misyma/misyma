import { type UseMutationOptions } from '@tanstack/react-query';

import { type ChangeUserPasswordRequestBody, type UpdateUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { UserApiError } from '../../../errors/userApiError';

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na zaaktualizowanie danych.',
  409: 'Dane zostały już nadpisane. Odśwież stronę i spróbuj jeszcze raz',
  500: 'Wewnętrzny błąd serwera.',
});

const changePassword = async (payload: ChangeUserPasswordRequestBody) => {
  const response = await api.post<UpdateUserResponseBody>(`/users/change-password`, payload);

  api.validateResponse(response, UserApiError, mapper);

  return response.data;
};

export const useChangeUserPasswordMutation = (
  options: UseMutationOptions<UpdateUserResponseBody, UserApiError, ChangeUserPasswordRequestBody>,
) => {
  return useErrorHandledMutation({
    mutationFn: changePassword,
    ...options,
  });
};
