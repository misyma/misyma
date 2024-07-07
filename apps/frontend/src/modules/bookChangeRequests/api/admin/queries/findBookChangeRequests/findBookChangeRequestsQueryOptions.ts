import { UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';
import { findBookChangeRequests, FindBookChangeRequestsPayload } from './findBookChangeRequests';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys';
import { FindBookChangeRequestsResponseBody } from '@common/contracts';

export const FindBookChangeRequestsQueryOptions = (
  payload: FindBookChangeRequestsPayload,
): UseQueryOptions<FindBookChangeRequestsResponseBody, Error, FindBookChangeRequestsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => findBookChangeRequests(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });
