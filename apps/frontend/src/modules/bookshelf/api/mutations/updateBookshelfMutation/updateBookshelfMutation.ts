import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateBookshelfPathParams,
  type UpdateBookshelfRequestBody,
  type UpdateBookshelfResponseBody,
} from '@common/contracts';

import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { invalidateBookshelvesQueriesPredicate } from '../../queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

type Payload = UpdateBookshelfRequestBody & UpdateBookshelfPathParams;

const updateBookshelf = async (payload: Payload) => {
  const path = ApiPaths.bookshelves.$bookshelfId.path;
  const resolvedPath = path.replace(ApiPaths.bookshelves.$bookshelfId.params.bookshelfId, payload.bookshelfId);

  const response = await api.patch<UpdateBookshelfResponseBody>(resolvedPath, payload);

  if (api.isErrorResponse(response)) {
    throw new ShelfApiError({
      apiResponseError: response.data.context,
      message: response.data.message,
      statusCode: response.status,
    });
  }

  return response.data;
};

export const useUpdateBookshelfMutation = (
  options: UseMutationOptions<UpdateBookshelfResponseBody, ShelfApiError, Payload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: updateBookshelf,
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
