import { queryOptions } from '@tanstack/react-query';

import { type FindUserBookByIdPayload, findUserBookById } from './findUserBook.js';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';

export const FindUserBookByIdQueryOptions = ({ accessToken, userBookId, userId }: FindUserBookByIdPayload) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findUserBookById, userBookId, userId],
    queryFn: () =>
      findUserBookById({
        userBookId,
        userId,
        accessToken,
      }),
    enabled: !!accessToken && userId && userBookId ? true : false,
  });
