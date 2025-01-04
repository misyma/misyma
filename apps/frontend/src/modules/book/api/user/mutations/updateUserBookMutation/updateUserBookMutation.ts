import { type UseMutationOptions } from '@tanstack/react-query';

import {
  type UpdateUserBookPathParams,
  type UpdateUserBookRequestBody,
  type UpdateUserBookResponseBody,
  type UploadUserBookImageResponseBody,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../errors/bookApiError';

export interface UpdateUserBookPayload extends UpdateUserBookPathParams, UpdateUserBookRequestBody {
  accessToken: string;
}

export const useUpdateUserBookMutation = (
  options: UseMutationOptions<UpdateUserBookResponseBody, BookApiError, UpdateUserBookPayload>,
) => {
  const mapper = new ErrorCodeMessageMapper({
    403: 'Brak pozwolenia na zaaktualizowanie danych książki',
  });

  const uploadImage = async (payload: UpdateUserBookPayload) => {
    const { accessToken, userBookId, ...rest } = payload;

    const response = await HttpService.patch<UploadUserBookImageResponseBody>({
      url: `/user-books/${userBookId}`,
      // eslint-disable-next-line
			body: rest as any,
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
