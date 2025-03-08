import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindUserBooksQueryParams, type FindUserBooksResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../../core/apiClient/apiClient.js';
import { BookApiError } from '../../../../errors/bookApiError.js';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

export const findBooksByBookshelfId = async (values: FindUserBooksQueryParams) => {
  const { bookshelfId, page, pageSize } = values;

  const queryParams: Record<string, string> = {
    sortDate: 'desc',
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

  const response = await api.get<FindUserBooksResponseBody>(`/user-books`, {
    params: queryParams,
  });

  if (api.isErrorResponse(response)) {
    throw new BookApiError({
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return response.data;
};

export const FindBooksByBookshelfIdQueryOptions = ({ bookshelfId, page, pageSize }: FindUserBooksQueryParams) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBooksByBookshelfId, bookshelfId, page, pageSize],
    queryFn: () =>
      findBooksByBookshelfId({
        bookshelfId,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
  });

export const invalidateBooksByBookshelfIdQuery = (
  vals: FindUserBooksQueryParams,
  queryKey: Readonly<Array<unknown>>,
) => {
  const predicates: Array<(queryKey: Readonly<Array<unknown>>) => boolean> = [];

  if (vals.bookshelfId) {
    predicates.push((queryKey) => queryKey[1] === vals.bookshelfId);
  }
  if (vals.page) {
    predicates.push((queryKey) => queryKey[3] === vals.page);
  }
  if (vals.pageSize) {
    predicates.push((queryKey) => queryKey[4] === vals.pageSize);
  }

  let res = true;

  predicates.forEach((predicate) => {
    res = predicate(queryKey);
  });

  return res;
};
