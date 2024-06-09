import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateUserBookPathParams,
  UpdateUserBookRequestBody,
  UpdateUserBookResponseBody,
  UploadUserBookImageResponseBody,
} from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError.js';
import { HttpService } from '../../../../modules/core/services/httpService/httpService.js';
import { ErrorCodeMessageMapper } from '../../../../modules/common/errorCodeMessageMapper/errorCodeMessageMapper.js';

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

  return useMutation({
    mutationFn: uploadImage,
    ...options,
  });
};
