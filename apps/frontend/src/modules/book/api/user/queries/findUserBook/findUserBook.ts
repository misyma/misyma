import { type FindUserBookPathParams, type FindUserBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../errors/bookApiError';

export interface FindUserBookByIdPayload extends FindUserBookPathParams {
  userId: string;
  accessToken: string;
}

export const findUserBookById = async (payload: FindUserBookByIdPayload): Promise<FindUserBookResponseBody> => {
  const mapper = new ErrorCodeMessageMapper({});

  const { accessToken } = payload;

  const response = await HttpService.get<FindUserBookResponseBody>({
    url: `/user-books/${payload.userBookId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new BookApiError({
      apiResponseError: response.body.context,
      statusCode: response.statusCode,
      message: mapper.map(response.statusCode),
    });
  }

  return response.body;
};
