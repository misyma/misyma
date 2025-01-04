import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBooksByBookshelfIdPayload, findBooksByBookshelfId } from './findBooksByBookshelfId.js';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';

export const FindBooksByBookshelfIdQueryOptions = ({
  accessToken,
  bookshelfId,
  userId,
  page,
  pageSize,
}: FindBooksByBookshelfIdPayload) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBooksByBookshelfId, bookshelfId, userId, page, pageSize],
    queryFn: () =>
      findBooksByBookshelfId({
        bookshelfId,
        accessToken: accessToken as string,
        userId,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
    enabled: !!accessToken && !!bookshelfId,
  });

export const invalidateBooksByBookshelfIdQuery = (
  vals: Partial<Omit<FindBooksByBookshelfIdPayload, 'accessToken'>>,
  queryKey: Readonly<Array<unknown>>,
) => {
  const predicates: Array<(queryKey: Readonly<Array<unknown>>) => boolean> = [];

  if (vals.bookshelfId) {
    predicates.push((queryKey) => queryKey[1] === vals.bookshelfId);
  }

  if (vals.userId) {
    predicates.push((queryKey) => queryKey[2] === vals.userId);
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
