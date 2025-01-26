import { type UseMutationOptions } from '@tanstack/react-query';

import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation.js';
import { HttpService } from '../../../../core/services/httpService/httpService.js';
import { ShelfApiError } from '../../errors/shelfApiError.js';

type UploadBookshelfImagePayload = {
  file: File;
  accessToken: string;
  bookshelfId: string;
};

export const useUploadBookshelfImageMutation = (
  options: UseMutationOptions<void, ShelfApiError, UploadBookshelfImagePayload>,
) => {
  const uploadBookshelfImage = async (payload: UploadBookshelfImagePayload) => {
    const formData = new FormData();

    formData.append('attachedFiles', payload.file, payload.file.name);

    const response = await HttpService.patch<void>({
      url: `/bookshelves/${payload.bookshelfId}/images`,
      // eslint-disable-next-line
      body: formData as any,
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
        ['Content-Type']: `multipart/form-data`,
      },
    });

    if (!response.success) {
      throw new ShelfApiError({
        apiResponseError: response.body.context,
        message: response.body.message,
        statusCode: response.statusCode,
      });
    }

    return;
  };

  return useErrorHandledMutation({
    mutationFn: uploadBookshelfImage,
    ...options,
  });
};
