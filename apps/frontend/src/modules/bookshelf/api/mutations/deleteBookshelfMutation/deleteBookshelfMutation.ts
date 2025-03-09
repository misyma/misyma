import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { type AxiosRequestConfig } from 'axios';

import { type DeleteBookshelfParams, type DeleteBookshelfQueryParams } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { invalidateBookshelvesQueriesPredicate } from '../../queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

type Payload = DeleteBookshelfParams & DeleteBookshelfQueryParams;

const mapper = new ErrorCodeMessageMapper({});

const deleteBookshelf = async (payload: Payload) => {
  const requestConfig: AxiosRequestConfig = {
    url: `/bookshelves/${payload.bookshelfId}`,
  };

  if (payload.fallbackBookshelfId) {
    requestConfig.params = {
      fallbackBookshelfId: payload.fallbackBookshelfId,
    };
  }

  const path = ApiPaths.bookshelves.$bookshelfId.path;
  const resolvedPath = path.replace('{{bookshelfId}}', payload.bookshelfId);
  const response = await api.delete(resolvedPath, requestConfig);

  api.validateResponse(response, ShelfApiError, mapper);

  return response.data;
};

export const useDeleteBookshelfMutation = (options: UseMutationOptions<void, ShelfApiError, Payload>) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteBookshelf,
    ...options,
    onSuccess: async (data, payload, context) => {
      if (options.onSuccess) {
        await options.onSuccess(data, payload, context);
      }
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateBookshelvesQueriesPredicate(queryKey),
      });
    },
  });
};
