import { queryOptions } from '@tanstack/react-query';
import { findBooks, FindBooksPayload } from './findBooks';
import { BookApiQueryKeys } from '../bookApiQueryKeys';

export const FindBooksQueryOptions = ({ accessToken, isbn, title, ...rest }: FindBooksPayload) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBooks, isbn, title],
    queryFn: () =>
      findBooks({
        accessToken: accessToken as string,
        isbn,
        title,
      }),
    enabled: !!accessToken,
    ...rest,
  });
