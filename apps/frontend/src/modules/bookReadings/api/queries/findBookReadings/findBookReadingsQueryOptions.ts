import { type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBookReadingsResponseBody } from '@common/contracts';

import { type FindBookReadingsPayload, findBookReadings } from './findBookReadings';
import { BookReadingsApiQueryKeys } from '../bookReadingsApiQueryKeys';

export const FindBookReadingsQueryOptions = (
  payload: FindBookReadingsPayload,
): UseQueryOptions<FindBookReadingsResponseBody, Error, FindBookReadingsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookReadingsApiQueryKeys.findBookReadings, payload.userBookId, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => findBookReadings(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });
