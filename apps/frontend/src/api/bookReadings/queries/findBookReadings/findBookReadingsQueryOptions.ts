import { UseQueryOptions, queryOptions } from '@tanstack/react-query';
import { FindBookReadingsPayload, findBookReadings } from './findBookReadings';
import { FindBookReadingsResponseBody } from '@common/contracts';

export const FindBookReadingsQueryOptions = (
  payload: FindBookReadingsPayload,
): UseQueryOptions<FindBookReadingsResponseBody, Error, FindBookReadingsResponseBody, string[]> =>
  queryOptions({
    queryKey: [`findBookReadings`, payload.userBookId],
    queryFn: () => findBookReadings(payload),
    enabled: !!payload.accessToken,
  });
