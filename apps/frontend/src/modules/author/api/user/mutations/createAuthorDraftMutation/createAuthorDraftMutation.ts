import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateAuthorRequestBody, type CreateAuthorResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { invalidateAdminAuthorsQueryPredicate } from '../../../admin/queries/findAdminAuthorsQuery/findAdminAuthorsQuery';
import { AuthorsApiQueryKeys } from '../../queries/authorsApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na stworzenie autora.`,
});

const createAuthor = async (payload: CreateAuthorRequestBody) => {
  const response = await api.post<CreateAuthorResponseBody>(ApiPaths.authors.path, payload);

  if (api.isErrorResponse(response)) {
    throw new ApiError('Author api error.', {
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return response.data;
};

export const useCreateAuthorDraftMutation = (
  options: UseMutationOptions<CreateAuthorResponseBody, ApiError, CreateAuthorRequestBody>,
) => {
  const queryClient = useQueryClient();

  return useErrorHandledMutation({
    mutationFn: createAuthor,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }

      await queryClient.invalidateQueries({
        // todo: refactor
        predicate: (query) =>
          query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery ||
          invalidateAdminAuthorsQueryPredicate(query.queryKey),
      });
    },
  });
};
