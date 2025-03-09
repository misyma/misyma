import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookshelfRequestBody, type CreateBookshelfResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { invalidateBookshelvesQueriesPredicate } from '../../queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

type CreateBookshelfPayload = CreateBookshelfRequestBody;

const mapper = new ErrorCodeMessageMapper({});

const createBookshelf = async (payload: CreateBookshelfPayload) => {
  const response = await api.post<CreateBookshelfResponseBody>(ApiPaths.bookshelves.path, payload);

  api.validateResponse(response, ShelfApiError, mapper);

  return response.data;
};

export const useCreateBookshelfMutation = (
  options: UseMutationOptions<CreateBookshelfResponseBody, ShelfApiError, CreateBookshelfPayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: createBookshelf,
    ...options,
    onSuccess: async (data, variables, context) => {
      if (options.onSuccess) {
        await options.onSuccess(data, variables, context);
      }

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateBookshelvesQueriesPredicate(queryKey),
      });
    },
  });
};
