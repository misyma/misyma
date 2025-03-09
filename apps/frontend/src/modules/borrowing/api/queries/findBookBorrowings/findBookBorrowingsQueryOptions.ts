import { queryOptions } from '@tanstack/react-query';

import {
  type FindBorrowingsResponseBody,
  type FindBorrowingsPathParams,
  type FindBorrowingsQueryParams,
} from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../core/apiClient/apiClient';
import { BorrowingApiQueryKeys } from '../borrowingApiQueryKeys';

export interface FindBookBorrowingsPayload extends FindBorrowingsPathParams, FindBorrowingsQueryParams {}

export const findBookBorrowings = async (payload: FindBookBorrowingsPayload) => {
  const { userBookId, ...query } = payload;

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

  const response = await api.get<FindBorrowingsResponseBody>(`/user-books/${userBookId}/borrowings`, {
    params: queryParams,
  });

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const FindBookBorrowingsQueryOptions = ({
  userBookId,
  page,
  pageSize,
  sortDate,
  isOpen,
}: FindBookBorrowingsPayload) =>
  queryOptions({
    queryKey: [BorrowingApiQueryKeys.findBookBorrowingsQuery, userBookId, page, pageSize, sortDate],
    queryFn: () =>
      findBookBorrowings({
        userBookId,
        page,
        pageSize,
        sortDate,
        isOpen,
      }),
  });
