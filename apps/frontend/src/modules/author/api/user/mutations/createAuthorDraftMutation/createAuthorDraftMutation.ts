import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateAuthorRequestBody, type CreateAuthorResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { AuthorApiError } from '../../../../errors/authorApiError';
import { invalidateAdminAuthorsQueryPredicate } from '../../../admin/queries/findAdminAuthorsQuery/findAdminAuthorsQuery';
import { AuthorsApiQueryKeys } from '../../queries/authorsApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na stworzenie autora.`,
});

const createAuthor = async (payload: CreateAuthorRequestBody) => {
  const response = await api.post<CreateAuthorResponseBody>(ApiPaths.authors.path, payload);

  api.validateResponse(response, AuthorApiError, mapper);

  return response.data;
};

export const useCreateAuthorDraftMutation = (
  options: UseMutationOptions<CreateAuthorResponseBody, AuthorApiError, CreateAuthorRequestBody>,
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
