import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteAuthorPathParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { AuthorApiError } from '../../../../errors/authorApiError';
import { AuthorsApiQueryKeys } from '../../../user/queries/authorsApiQueryKeys';
import { invalidateAdminAuthorsQueryPredicate } from '../../queries/findAdminAuthorsQuery/findAdminAuthorsQuery';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie autora.`,
});

const deleteAuthor = async (payload: DeleteAuthorPathParams) => {
  const response = await api.delete(`/admin/authors/${payload.authorId}`);

  api.validateResponse(response, AuthorApiError, mapper);

  return;
};

export const useDeleteAuthorMutation = (options: UseMutationOptions<void, AuthorApiError, DeleteAuthorPathParams>) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteAuthor,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery ||
          invalidateAdminAuthorsQueryPredicate(query.queryKey),
      });
    },
  });
};
