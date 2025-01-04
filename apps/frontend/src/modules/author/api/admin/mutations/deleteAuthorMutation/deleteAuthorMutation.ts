import { type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteAuthorPathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';

interface Payload extends DeleteAuthorPathParams {
  accessToken: string | undefined;
}

export const useDeleteAuthorMutation = (options: UseMutationOptions<void, ApiError, Payload>) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na usunięcie autora.`,
  });

  const deleteAuthor = async (payload: Payload) => {
    const response = await HttpService.delete({
      url: `/admin/authors/${payload.authorId}`,
      body: payload as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.success) {
      throw new ApiError('Author api error.', {
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return;
  };

  return useErrorHandledMutation({
    mutationFn: deleteAuthor,
    ...options,
  });
};
