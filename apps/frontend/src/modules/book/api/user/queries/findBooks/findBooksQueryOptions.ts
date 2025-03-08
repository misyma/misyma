import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindBooksQueryParams, type FindBooksResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../bookApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({});

export const findBooks = async (values: FindBooksQueryParams) => {
  const { isbn, title, page, pageSize } = values;

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

  const response = await api.get<FindBooksResponseBody>(ApiPaths.books.path, {
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

export const FindBooksQueryOptions = ({ isbn, title, page, pageSize }: FindBooksQueryParams) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBooks, isbn, title, page, pageSize],
    queryFn: () =>
      findBooks({
        isbn,
        title,
        page,
        pageSize,
      }),
  });

export const FindBooksInfiniteQueryOptions = ({ isbn, page = 1, pageSize, title }: FindBooksQueryParams) =>
  infiniteQueryOptions({
    queryKey: [BookApiQueryKeys.findBooks, isbn, title, page, pageSize],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      findBooks({
        page: pageParam,
        title,
        pageSize,
      }),
    getNextPageParam: api.getNextPageParam,
    getPreviousPageParam: api.getPreviousPageParam,
  });
