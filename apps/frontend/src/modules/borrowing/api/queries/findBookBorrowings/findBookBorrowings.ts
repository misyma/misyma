import {
  type FindBorrowingsPathParams,
  type FindBorrowingsQueryParams,
  type FindBorrowingsResponseBody,
  type SortingType,
} from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../core/services/httpService/httpService';

export interface FindBookBorrowingsPayload extends FindBorrowingsPathParams, FindBorrowingsQueryParams {
  sortDate: SortingType;
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

  if (query.isOpen !== undefined) {
    queryParams.isOpen = `${query.isOpen}`;
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
