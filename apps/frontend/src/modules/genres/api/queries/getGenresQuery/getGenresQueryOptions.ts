import { FindGenresResponseBody } from '@common/contracts';
import { UseQueryOptions, queryOptions } from '@tanstack/react-query';
import { GetGenresPayload, getGenres } from './getGenres.js';

export const getGenresQueryOptions = (
  payload: GetGenresPayload,
): UseQueryOptions<FindGenresResponseBody, Error, FindGenresResponseBody, string[]> =>
  queryOptions({
    queryKey: [`findGenres`, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => getGenres(payload),
    enabled: !!payload.accessToken,
  });
