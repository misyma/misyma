import { queryOptions } from '@tanstack/react-query';
import { findBooks, FindBooksPayload } from './findBooks';

export const FindBooksQueryOptions = ({ accessToken, isbn, title, ...rest }: FindBooksPayload) =>
  queryOptions({
    queryKey: ['findBooksQuery', isbn, title],
    queryFn: () =>
      findBooks({
        accessToken: accessToken as string,
        isbn,
        title,
      }),
    enabled: !!accessToken,
    ...rest,
  });
