import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateAuthorRequestBody, type CreateAuthorResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { AuthorApiError } from '../../../../errors/authorApiError';
import { AuthorsApiQueryKeys } from '../../../user/queries/authorsApiQueryKeys';
import { invalidateAdminAuthorsQueryPredicate } from '../../queries/findAdminAuthorsQuery/findAdminAuthorsQuery';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na stworzenie autora.`,
  409: `Autor już istnieje.`,
});

const createAuthor = async (payload: CreateAuthorRequestBody) => {
  const { name } = payload;

  const response = await api.post<CreateAuthorResponseBody>(
    '/admin/authors',
    { name },
    {
      errorCtor: AuthorApiError,
      mapper,
    },
  );

  return response.data;
};

export const useCreateAuthorMutation = (
  options: UseMutationOptions<CreateAuthorResponseBody, AuthorApiError, CreateAuthorRequestBody>,
) => {
  const queryClient = useQueryClient();

  return useErrorHandledMutation({
    mutationFn: createAuthor,
    ...options,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        // todo: refactor
        predicate: (query) =>
          query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery ||
          invalidateAdminAuthorsQueryPredicate(query.queryKey),
      });
    },
  });
};
