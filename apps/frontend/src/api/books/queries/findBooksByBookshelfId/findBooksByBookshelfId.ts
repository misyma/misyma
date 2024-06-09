import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { FindUserBooksQueryParams, FindUserBooksResponseBody } from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError';

export interface FindBooksByBookshelfIdPayload extends FindUserBooksQueryParams {
  accessToken: string;
  userId: string;
}

export const findBooksByBookshelfId = async (values: FindBooksByBookshelfIdPayload) => {
  const mapper = new ErrorCodeMessageMapper({});

  const { bookshelfId, accessToken } = values;

  const response = await HttpService.get<FindUserBooksResponseBody>({
    url: `/user-books?bookshelfId=${bookshelfId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.success === false) {
    throw new BookApiError({
      apiResponseError: response.body.context,
      message: mapper.map(response.statusCode),
      statusCode: response.statusCode,
    });
  }

  return response.body;
};
