import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateAuthorPathParams,
  type UpdateAuthorRequestBody,
  type UpdateAuthorResponseBody,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { AuthorApiError } from '../../../../errors/authorApiError';
import { AuthorsApiQueryKeys } from '../../../user/queries/authorsApiQueryKeys';
import { invalidateAdminAuthorsQueryPredicate } from '../../queries/findAdminAuthorsQuery/findAdminAuthorsQuery';

interface Payload extends UpdateAuthorPathParams, UpdateAuthorRequestBody {}

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na zmianę danych autora.`,
  409: `Autor o podanym imieniu i nazwisku już istnieje.`,
});

const updateAuthor = async (payload: Payload) => {
  const { authorId, ...rest } = payload;

  const response = await api.patch<UpdateAuthorResponseBody>(`/admin/authors/${authorId}`, rest, {
    errorCtor: AuthorApiError,
    mapper,
  });

  return response.data;
};

export const useUpdateAuthorMutation = (
  options: UseMutationOptions<UpdateAuthorResponseBody, AuthorApiError, Payload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: updateAuthor,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      // todo: refactor
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery || invalidateAdminAuthorsQueryPredicate(queryKey),
      });
    },
  });
};
