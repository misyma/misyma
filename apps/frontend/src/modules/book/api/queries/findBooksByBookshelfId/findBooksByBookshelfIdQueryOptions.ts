import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { FindBooksByBookshelfIdPayload, findBooksByBookshelfId } from './findBooksByBookshelfId.js';

export const FindBooksByBookshelfIdQueryOptions = ({
  accessToken,
  bookshelfId,
  userId,
}: FindBooksByBookshelfIdPayload) =>
  queryOptions({
    queryKey: ['findBooksByBookshelfId', bookshelfId, userId],
    queryFn: () =>
      findBooksByBookshelfId({
        bookshelfId,
        accessToken: accessToken as string,
        userId,
      }),
    placeholderData: keepPreviousData,
    enabled: !!accessToken && !!bookshelfId,
  });
