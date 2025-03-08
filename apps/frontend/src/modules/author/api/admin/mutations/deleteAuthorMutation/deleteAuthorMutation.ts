import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteAuthorPathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { AuthorsApiQueryKeys } from '../../../user/queries/authorsApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie autora.`,
});

const deleteAuthor = async (payload: DeleteAuthorPathParams) => {
  const response = await api.delete(`/admin/authors/${payload.authorId}`);

  if (api.isErrorResponse(response)) {
    throw new ApiError('Author api error.', {
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return;
};

export const useDeleteAuthorMutation = (options: UseMutationOptions<void, ApiError, DeleteAuthorPathParams>) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteAuthor,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
      });
    },
  });
};
