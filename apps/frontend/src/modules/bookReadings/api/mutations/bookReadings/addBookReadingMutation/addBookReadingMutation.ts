import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type BookReading,
  type CreateBookReadingRequestBody,
  type CreateBookReadingPathParams,
  type CreateBookReadingResponseBody,
} from '@common/contracts';

import { BookApiQueryKeys } from '../../../../../book/api/user/queries/bookApiQueryKeys';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { invalidateBookReadingsQueryPredicate } from '../../../queries/findBookReadings/findBookReadingsQueryOptions';

type AddBookReadingMutationPayload = CreateBookReadingRequestBody & CreateBookReadingPathParams;

const mapper = new ErrorCodeMessageMapper({});

const addBookReading = async (payload: AddBookReadingMutationPayload) => {
  const { userBookId, ...body } = payload;

  const response = await api.post<CreateBookReadingResponseBody>(`/user-books/${userBookId}/readings`, body, {
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const useAddBookReadingMutation = (
  options?: UseMutationOptions<BookReading, BookApiError, AddBookReadingMutationPayload, unknown>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: addBookReading,
    ...options,
    onSuccess: async (...args) => {
      if (options?.onSuccess) {
        await options.onSuccess(...args);
      }
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateBookReadingsQueryPredicate(queryKey, args[1].userBookId) ||
          queryKey.includes(BookApiQueryKeys.findUserBooksBy),
      });
    },
  });
};
