import { UseQueryOptions, queryOptions } from '@tanstack/react-query';
import { FindBookByIdPayload, findBookById } from './findBookById';
import { FindBookResponseBody } from '@common/contracts';

export const FindBookByIdQueryOptions = (
  payload: FindBookByIdPayload,
): UseQueryOptions<FindBookResponseBody, Error, FindBookResponseBody, string[]> =>
  queryOptions({
    queryKey: [`findBookById`, payload.bookId],
    queryFn: () => findBookById(payload),
    enabled: !!payload.accessToken && !!payload.bookId,
  });
