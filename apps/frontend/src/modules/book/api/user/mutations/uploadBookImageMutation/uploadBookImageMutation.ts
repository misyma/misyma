import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type UploadUserBookImageResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation.js';
import { api } from '../../../../../core/apiClient/apiClient.js';
import { BookApiError } from '../../../../errors/bookApiError.js';
import { invalidateUserBooksByBookshelfIdQuery } from '../../queries/findUserBooksByBookshelfId/findUserBooksByBookshelfIdQueryOptions.js';
import { invalidateFindUserBookByIdQueryPredicate } from '../../queries/findUserBook/findUserBookByIdQueryOptions.js';
import { invalidateFindUserBooksByQuery } from '../../queries/findUserBookBy/findUserBooksByQueryOptions.js';

export interface UploadBookImageMutationPayload {
  bookId: string;
  file: File;
}

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na dodania obrazka do książki`,
});

const uploadImage = async (payload: UploadBookImageMutationPayload) => {
  const { bookId, file } = payload;

  const formData = new FormData();
  formData.append('attachedFiles', file, file.name);

  const response = await api.patch<UploadUserBookImageResponseBody>(`/user-books/${bookId}/images`, formData);

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const useUploadBookImageMutation = (
  options: UseMutationOptions<UploadUserBookImageResponseBody, BookApiError, UploadBookImageMutationPayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: uploadImage,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
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
            invalidateFindUserBookByIdQueryPredicate(queryKey, args[1].bookId)
          );
        },
      });
    },
  });
};
