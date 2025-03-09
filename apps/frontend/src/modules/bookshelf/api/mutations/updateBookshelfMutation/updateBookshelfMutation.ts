import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateBookshelfPathParams,
  type UpdateBookshelfRequestBody,
  type UpdateBookshelfResponseBody,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { invalidateBookshelvesQueriesPredicate } from '../../queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

type Payload = UpdateBookshelfRequestBody & UpdateBookshelfPathParams;

const mapper = new ErrorCodeMessageMapper({});

const updateBookshelf = async (payload: Payload) => {
  const path = ApiPaths.bookshelves.$bookshelfId.path;
  const resolvedPath = path.replace('{{bookshelfId}}', payload.bookshelfId);

  const response = await api.patch<UpdateBookshelfResponseBody>(resolvedPath, payload);

  api.validateResponse(response, ShelfApiError, mapper);

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
