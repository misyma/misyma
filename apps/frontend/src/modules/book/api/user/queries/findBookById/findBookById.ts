import { FindBookPathParams, FindBookResponseBody } from '@common/contracts';
import { BookApiError } from '../../../../errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface FindBookByIdPayload extends FindBookPathParams {
  accessToken: string;
}

export const findBookById = async (payload: FindBookByIdPayload): Promise<FindBookResponseBody> => {
  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na podejrzenie książki.`,
  });

  const response = await HttpService.get<FindBookResponseBody>({
    url: `/books/${payload.bookId}`,
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
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
