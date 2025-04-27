import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateUserBookPathParams,
  type UpdateUserBookRequestBody,
  type UpdateUserBookResponseBody,
  type UploadUserBookImageResponseBody,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../queries/bookApiQueryKeys';
import { invalidateUserBooksByBookshelfIdQuery } from '../../queries/findUserBooksByBookshelfId/findUserBooksByBookshelfIdQueryOptions';
import { invalidateFindUserBookByIdQueryPredicate } from '../../queries/findUserBook/findUserBookByIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../queries/findUserBookBy/findUserBooksByQueryOptions';

export interface UpdateUserBookPayload extends UpdateUserBookPathParams, UpdateUserBookRequestBody {}

const mapper = new ErrorCodeMessageMapper({
  403: 'Brak pozwolenia na zaaktualizowanie danych książki',
});

const updateBook = async (payload: UpdateUserBookPayload) => {
  const { userBookId, ...rest } = payload;

  const response = await api.patch<UploadUserBookImageResponseBody>(`/user-books/${userBookId}`, rest, {
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const useUpdateUserBookMutation = (
  options: UseMutationOptions<UpdateUserBookResponseBody, BookApiError, UpdateUserBookPayload>,
) => {
  const queryClient = useQueryClient();

  return useErrorHandledMutation({
    mutationFn: updateBook,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          return (
            invalidateFindUserBooksByQuery({}, queryKey, true) ||
            invalidateFindUserBooksByQuery({ bookshelfId: args[0].bookshelfId }, queryKey, false) ||
            invalidateUserBooksByBookshelfIdQuery(
              {
                bookshelfId: args[0].bookshelfId,
              },
              queryKey,
            ) ||
            invalidateFindUserBookByIdQueryPredicate(queryKey, args[1].userBookId) ||
            (queryKey[0] === BookApiQueryKeys.findUserBookById && queryKey[1] === args[0].bookshelfId)
          );
        },
      });
    },
  });
};
