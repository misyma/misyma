import { type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateAuthorPathParams,
  type UpdateAuthorRequestBody,
  type UpdateAuthorResponseBody,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';

interface Payload extends UpdateAuthorPathParams, UpdateAuthorRequestBody {
  accessToken: string | undefined;
}

export const useUpdateAuthorMutation = (options: UseMutationOptions<UpdateAuthorResponseBody, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na zmianę danych autora.`,
    409: `Autor o podanym imieniu i nazwisku już istnieje.`,
  });

  const updateAuthor = async (payload: Payload) => {
    const { accessToken, authorId, ...rest } = payload;

    const response = await HttpService.patch<UpdateAuthorResponseBody>({
      url: `/admin/authors/${authorId}`,
      body: rest as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new ApiError('Author api error.', {
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: updateAuthor,
    ...options,
  });
};
