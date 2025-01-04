import { type UseMutationOptions } from '@tanstack/react-query';

import { type UpdateUserRequestBody, type UpdateUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { UserApiError } from '../../../errors/userApiError';

export interface UseUpdateUserMutationPayload extends UpdateUserRequestBody {
  accessToken: string;
  userId: string;
}

export const useUpdateUserMutation = (
  options: UseMutationOptions<UpdateUserResponseBody, UserApiError, UseUpdateUserMutationPayload>,
) => {
  const updateUser = async (payload: UseUpdateUserMutationPayload) => {
    const { accessToken, userId, ...body } = payload;

    const mapper = new ErrorCodeMessageMapper({
      400: 'Podano błędne dane.',
      403: 'Brak pozwolenia na zaaktualizowanie danych.',
      409: 'Dane zostały już nadpisane. Odśwież stronę i spróbuj jeszcze raz',
      500: 'Wewnętrzny błąd serwera.',
    });

    const response = await HttpService.patch<UpdateUserResponseBody>({
      url: `/users/${userId}`,
      body: body as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new UserApiError({
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: updateUser,
    ...options,
  });
};
