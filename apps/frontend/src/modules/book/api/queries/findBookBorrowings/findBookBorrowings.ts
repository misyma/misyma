import { FindBorrowingsPathParams, FindBorrowingsQueryParams, FindBorrowingsResponseBody, SortingType } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { BookApiError } from '../../../errors/bookApiError';

export interface FindBookBorrowingsPayload extends FindBorrowingsPathParams, FindBorrowingsQueryParams {
  sortDate: SortingType
  accessToken: string;
}

export const findBookBorrowings = async (payload: FindBookBorrowingsPayload) => {
  const { accessToken, userBookId, ...query } = payload;

  const mapper = new ErrorCodeMessageMapper({});

  const queryParams: Record<string, string> = {};

  if (query.page) {
    queryParams.page = `${query.page}`;
  }

  if (query.pageSize) {
    queryParams.pageSize = `${query.pageSize}`;
  }

  if (query.sortDate) {
    queryParams.sortDate = `${query.sortDate}`;
  }

  const response = await HttpService.get<FindBorrowingsResponseBody>({
    url: `/user-books/${userBookId}/borrowings`,
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
