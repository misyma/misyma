import { type UseMutationOptions } from '@tanstack/react-query';

import { type UploadUserBookImageResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation.js';
import { HttpService } from '../../../../../core/services/httpService/httpService.js';
import { BookApiError } from '../../../../errors/bookApiError.js';

export interface UploadBookImageMutationPayload {
  bookId: string;
  file: File;
  accessToken: string;
}

export const useUploadBookImageMutation = (
  options: UseMutationOptions<UploadUserBookImageResponseBody, BookApiError, UploadBookImageMutationPayload>,
) => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na dodania obrazka do książki`,
  });

  const uploadImage = async (payload: UploadBookImageMutationPayload) => {
    const { accessToken, bookId, file } = payload;

    const formData = new FormData();

    formData.append('attachedFiles', file, file.name);

    const response = await HttpService.patch<UploadUserBookImageResponseBody>({
      url: `/user-books/${bookId}/images`,
      // eslint-disable-next-line
      body: formData as any,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ['Content-Type']: `multipart/form-data`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: uploadImage,
    ...options,
  });
};
