import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { BookApiQueryKeys } from '../bookApiQueryKeys.js';
import { findUserBooksBy, type FindUserBooksByPayload } from './findUserBooksBy.js';

export const FindUserBooksByQueryOptions = ({ accessToken, ...rest }: FindUserBooksByPayload) =>
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
        accessToken,
        ...rest,
      }),
    enabled: !!accessToken,
  });

export const FindUserBooksByInfiniteQueryOptions = ({ accessToken, page = 1, ...rest }: FindUserBooksByPayload) =>
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
        accessToken,
        page: pageParam,
        ...rest,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) {
        return undefined;
      }

      if (lastPage.metadata.total === 0) {
        return undefined;
      }

      const totalPages = Math.ceil(lastPage.metadata.total / lastPage.metadata.pageSize);

      if (lastPage.metadata.page === totalPages) {
        return undefined;
      }

      return lastPage.metadata.page + 1;
    },
    getPreviousPageParam: (lastPage) => {
      if (lastPage.metadata.page > 1) {
        return lastPage.metadata.page - 1;
      }

      return undefined;
    },
    enabled: !!accessToken,
  });

export const invalidateFindUserBooksByQuery = (
  vals: Partial<Omit<FindUserBooksByPayload, 'accessToken'>>,
  queryKey: Readonly<Array<unknown>>,
  infiniteQuery?: boolean,
) => {
  const predicates: Array<(queryKey: Readonly<Array<unknown>>) => boolean> = [];

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
