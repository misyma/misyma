import { type FindUserBooksQueryParams, type FindUserBooksResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../errors/bookApiError';

export interface FindBooksByBookshelfIdPayload extends FindUserBooksQueryParams {
  accessToken: string;
  userId: string;
}

export const findBooksByBookshelfId = async (values: FindBooksByBookshelfIdPayload) => {
  const mapper = new ErrorCodeMessageMapper({});

  const { bookshelfId, accessToken, page, pageSize } = values;

  const queryParams: Record<string, string> = {
    sortDate: 'desc',
    expandFields: 'readings',
  };

  if (page) {
    queryParams['page'] = `${page}`;
  }

  if (pageSize) {
    queryParams['pageSize'] = `${pageSize}`;
  }

  if (bookshelfId) {
    queryParams['bookshelfId'] = bookshelfId;
  }

  // For skeleton testing
  // await new Promise((res) => {
  //   setTimeout(res, 10000);
  // });

  const response = await HttpService.get<FindUserBooksResponseBody>({
    url: `/user-books`,
    queryParams,
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
