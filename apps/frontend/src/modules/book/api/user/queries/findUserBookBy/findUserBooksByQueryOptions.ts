import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindUserBooksQueryParams, type FindUserBooksResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../../core/apiClient/apiClient.js';
import { BookApiError } from '../../../../errors/bookApiError.js';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

export const findUserBooksBy = async (payload: FindUserBooksQueryParams): Promise<FindUserBooksResponseBody> => {
  const queryParams: Record<string, string> = {};
  const keys: Array<keyof FindUserBooksQueryParams> = [
    'bookshelfId',
    'isbn',
    'page',
    'title',
    'pageSize',
    'releaseYearBefore',
    'releaseYearAfter',
    'language',
    'status',
    'genreId',
    'isFavorite',
    'authorId',
    'sortField',
    'sortOrder',
  ];

  keys.forEach((key) => {
    if (payload[key] !== '' && payload[key] !== undefined) {
      queryParams[key] = `${payload[key]}`;
    }
  });

  const response = await api.get<FindUserBooksResponseBody>('/user-books', {
    params: queryParams,
    validateStatus: () => true,
  });

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const FindUserBooksByQueryOptions = ({ ...rest }: FindUserBooksQueryParams) =>
  queryOptions({
    queryKey: [
      BookApiQueryKeys.findUserBooksBy,
      rest.isbn,
      rest.bookshelfId,
      rest.page,
      rest.pageSize,
      rest.sortField,
      rest.sortOrder,
    ],
    queryFn: () =>
      findUserBooksBy({
        ...rest,
      }),
  });

export const FindUserBooksByInfiniteQueryOptions = ({ page = 1, ...rest }: FindUserBooksQueryParams) =>
  infiniteQueryOptions({
    queryKey: [
      BookApiQueryKeys.findUserBooksBy,
      rest.bookshelfId,
      rest.isbn,
      page,
      rest.pageSize,
      'infinite-query',
      rest.releaseYearAfter,
      rest.releaseYearBefore,
      rest.language,
      rest.title,
      rest.genreId,
      rest.status,
      rest.authorId,
      rest.isFavorite,
      rest.sortField,
      rest.sortOrder,
    ],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      findUserBooksBy({
        page: pageParam,
        ...rest,
      }),
    getNextPageParam: api.getNextPageParam,
    getPreviousPageParam: api.getPreviousPageParam,
  });

export const invalidateFindUserBooksByQuery = (
  vals: FindUserBooksQueryParams,
  queryKey: Readonly<Array<unknown>>,
  infiniteQuery?: boolean,
) => {
  const predicates: Array<(queryKey: Readonly<Array<unknown>>) => boolean> = [
    (queryKey) => queryKey[0] === BookApiQueryKeys.findUserBooksBy,
  ];

  if (infiniteQuery) {
    predicates.push((queryKey) => queryKey.includes('infinite-query'));
  }

  if (vals.bookshelfId) {
    predicates.push((queryKey) => queryKey[1] === vals.bookshelfId);
  }

  let res = false;

  predicates.forEach((predicate) => {
    res = predicate(queryKey);
  });

  return res;
};
