import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteBookReadingPathParams } from '@common/contracts';

import { BookApiQueryKeys } from '../../../../../book/api/user/queries/bookApiQueryKeys';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { invalidateBookReadingsQueryPredicate } from '../../../queries/findBookReadings/findBookReadingsQueryOptions';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na usunięcie oceny.`,
});

const deleteBookReading = async (payload: DeleteBookReadingPathParams) => {
  let path: string = ApiPaths.userBooks.$userBookId.readings.$readingId.path;
  path = path.replace('{{userBookId}}', payload.userBookId);
  path = path.replace('{{readingId}}', payload.readingId);
  const response = await api.delete(path);

  api.validateResponse(response, BookApiError, mapper);
};

export const useDeleteBookReadingMutation = (
  options: UseMutationOptions<void, ApiError, DeleteBookReadingPathParams>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: deleteBookReading,
    ...options,
    onSuccess: async (data, variables, context) => {
      if (options.onSuccess) {
        await options.onSuccess(data, variables, context);
      }

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateBookReadingsQueryPredicate(queryKey, variables.userBookId) ||
          queryKey.includes(BookApiQueryKeys.findUserBooksBy),
      });
    },
  });
};
