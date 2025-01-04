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
