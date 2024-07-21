import { FindBooksQueryParams, FindBooksResponseBody } from '@common/contracts';
import { BookApiError } from '../../../../errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface FindBooksPayload extends FindBooksQueryParams {
  accessToken: string;
}

export const findBooks = async (values: FindBooksPayload) => {
  const mapper = new ErrorCodeMessageMapper({});

  const { accessToken, isbn, title, page, pageSize } = values;

  const queryParams: Record<string, string> = {};

  if (title) {
    queryParams['title'] = title;
  }

  if (isbn) {
    queryParams['isbn'] = isbn;
  }

  if (page) {
    queryParams['page'] = `${page}`;
  }

  if (pageSize) {
    queryParams['pageSize'] = `${pageSize}`;
  }

  const response = await HttpService.get<FindBooksResponseBody>({
    url: `/books`,
    queryParams,
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
