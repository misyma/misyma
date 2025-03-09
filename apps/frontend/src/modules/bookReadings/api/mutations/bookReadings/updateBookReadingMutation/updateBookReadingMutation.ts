import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type BookReading,
  type CreateBookReadingResponseBody,
  type UpdateBookReadingRequestBody,
  type UpdateBookReadingPathParams,
} from '@common/contracts';

import { BookApiQueryKeys } from '../../../../../book/api/user/queries/bookApiQueryKeys';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { invalidateBookReadingsQueryPredicate } from '../../../queries/findBookReadings/findBookReadingsQueryOptions';

type UpdateBookReadingMutationPayload = UpdateBookReadingRequestBody & UpdateBookReadingPathParams;

const mapper = new ErrorCodeMessageMapper({});

const updateBookReading = async (payload: UpdateBookReadingMutationPayload) => {
  const { userBookId, readingId, ...body } = payload;

  let path: string = ApiPaths.userBooks.$userBookId.readings.$readingId.path;
  path = path.replace('{{userBookId}', userBookId);
  path = path.replace('{{readingId}}', readingId);

  const response = await api.patch<CreateBookReadingResponseBody>(path, body);

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const useUpdateBookReadingMutation = (
  options?: UseMutationOptions<BookReading, BookApiError, UpdateBookReadingMutationPayload, unknown>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: updateBookReading,
    ...options,
    onSuccess: async (data, variables, context) => {
      if (options?.onSuccess) {
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
