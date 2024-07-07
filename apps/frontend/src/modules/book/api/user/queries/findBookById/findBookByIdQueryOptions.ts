import { UseQueryOptions, queryOptions } from '@tanstack/react-query';
import { FindBookByIdPayload, findBookById } from './findBookById';
import { FindBookResponseBody } from '@common/contracts';
import { BookApiQueryKeys } from '../bookApiQueryKeys';

export const FindBookByIdQueryOptions = (
  payload: FindBookByIdPayload,
): UseQueryOptions<FindBookResponseBody, Error, FindBookResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBookById, payload.bookId],
    queryFn: () => findBookById(payload),
    enabled: !!payload.accessToken && !!payload.bookId,
  });
