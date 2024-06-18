import { FindGenresResponseBody } from '@common/contracts';
import { UseQueryOptions, queryOptions } from '@tanstack/react-query';
import { GetGenresPayload, getGenres } from './getGenres.js';
import { GenresApiQueryKeys } from '../genresApiQueryKeys.js';

export const getGenresQueryOptions = (
  payload: GetGenresPayload,
): UseQueryOptions<FindGenresResponseBody, Error, FindGenresResponseBody, string[]> =>
  queryOptions({
    queryKey: [GenresApiQueryKeys.findGenres, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => getGenres(payload),
    enabled: !!payload.accessToken,
  });
