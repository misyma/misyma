import { UpdateBookPathParams, UpdateBookRequestBody } from '@common/contracts';
import { BookApiError } from '../../../../errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface UpdateBookPayload extends UpdateBookPathParams, UpdateBookRequestBody {
  accessToken: string;
}

export const updateBook = async (payload: UpdateBookPayload): Promise<void> => {
  const { accessToken, bookId, ...rest } = payload;

  const mapper = new ErrorCodeMessageMapper({});

  const response = await HttpService.patch({
    url: `/admin/books/${bookId}`,
    body: rest,
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
};
