import { queryOptions } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';
import { findUserBooksBy, FindUserBooksByPayload } from './findUserBooksBy.js';

export const FindUserBooksByQueryOptions = ({ accessToken, ...rest }: FindUserBooksByPayload) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findUserBooksBy, rest.isbn, rest.bookshelfId, rest.page, rest.pageSize],
    queryFn: () =>
      findUserBooksBy({
        accessToken,
        ...rest,
      }),
    enabled: !!accessToken,
  });
