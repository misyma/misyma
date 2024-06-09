import { queryOptions } from '@tanstack/react-query';
import { FindUserBookByIdPayload, findUserBookById } from './findUserBook.js';

export const FindUserBookQueryOptions = ({ accessToken, userBookId, userId }: FindUserBookByIdPayload) =>
  queryOptions({
    queryKey: ['findUserBookById', userBookId, userId],
    queryFn: () =>
      findUserBookById({
        userBookId,
        userId,
        accessToken,
      }),
    enabled: !!accessToken && userId ? true : false,
  });
