import { DeleteAuthorPathParams } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';

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

  return useMutation({
    mutationFn: deleteAuthor,
    ...options,
  });
};
