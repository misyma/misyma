import { queryOptions } from '@tanstack/react-query';
import { findBooks, FindBooksPayload } from './findBooks';
import { BookApiQueryKeys } from '../bookApiQueryKeys';

export const FindBooksQueryOptions = ({ accessToken, isbn, title, page, pageSize }: FindBooksPayload) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBooks, isbn, title, page],
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
