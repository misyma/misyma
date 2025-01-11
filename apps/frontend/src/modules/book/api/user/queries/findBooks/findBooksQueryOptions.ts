import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { findBooks, type FindBooksPayload } from './findBooks';
import { BookApiQueryKeys } from '../bookApiQueryKeys';

export const FindBooksQueryOptions = ({ accessToken, isbn, title, page, pageSize }: FindBooksPayload) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBooks, isbn, title, page, pageSize],
    queryFn: () =>
      findBooks({
        accessToken: accessToken as string,
        isbn,
        title,
        page,
        pageSize,
      }),
    enabled: !!accessToken,
  });

export const FindBooksInfiniteQueryOptions = ({ accessToken, isbn, page = 1, pageSize, title }: FindBooksPayload) =>
  infiniteQueryOptions({
    queryKey: [BookApiQueryKeys.findBooks, isbn, title, page, pageSize],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      findBooks({
        accessToken,
        page: pageParam,
        title,
        pageSize,
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
