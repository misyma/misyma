import { type UseMutationOptions } from '@tanstack/react-query';

import { type ChangeUserPasswordRequestBody, type UpdateUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { UserApiError } from '../../../errors/userApiError';

export interface UserChangeUserPasswordMutationPayload extends ChangeUserPasswordRequestBody {
  accessToken: string;
}

export const useChangeUserPasswordMutation = (
  options: UseMutationOptions<UpdateUserResponseBody, UserApiError, UserChangeUserPasswordMutationPayload>,
) => {
  const changePassword = async (payload: UserChangeUserPasswordMutationPayload) => {
    const { accessToken, ...body } = payload;

    const mapper = new ErrorCodeMessageMapper({
      400: 'Podano błędne dane.',
      403: 'Brak pozwolenia na zaaktualizowanie danych.',
      409: 'Dane zostały już nadpisane. Odśwież stronę i spróbuj jeszcze raz',
      500: 'Wewnętrzny błąd serwera.',
    });

    const response = await HttpService.post<UpdateUserResponseBody>({
      url: `/users/change-password`,
      body: {
        ...body,
        token: accessToken,
      } as unknown as Record<string, unknown>,
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
    mutationFn: changePassword,
    ...options,
  });
};
