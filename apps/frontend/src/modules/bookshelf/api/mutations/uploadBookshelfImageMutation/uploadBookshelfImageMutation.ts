import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation.js';
import { api } from '../../../../core/apiClient/apiClient.js';
import { ApiPaths } from '../../../../core/apiClient/apiPaths.js';
import { ShelfApiError } from '../../errors/shelfApiError.js';
import { invalidateBookshelvesQueriesPredicate } from '../../queries/findUserBookshelfsQuery/findUserBookshelfsQuery.js';

type UploadBookshelfImagePayload = {
  file: File;
  bookshelfId: string;
};

const mapper = new ErrorCodeMessageMapper({});

const uploadBookshelfImage = async (payload: UploadBookshelfImagePayload) => {
  const formData = new FormData();

  formData.append('attachedFiles', payload.file, payload.file.name);

  const path = ApiPaths.bookshelves.$bookshelfId.images.path;
  const resolvedPath = path.replace('{{bookshelfId}}', payload.bookshelfId);

  const response = await api.patch(resolvedPath, formData);

  api.validateResponse(response, ShelfApiError, mapper);
};

export const useUploadBookshelfImageMutation = (
  options: UseMutationOptions<void, ShelfApiError, UploadBookshelfImagePayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: uploadBookshelfImage,
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
