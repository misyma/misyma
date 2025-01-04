import { type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBookChangeRequestsResponseBody } from '@common/contracts';

import { findBookChangeRequests, type FindBookChangeRequestsPayload } from './findBookChangeRequests';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys';

export const FindBookChangeRequestsQueryOptions = (
  payload: FindBookChangeRequestsPayload,
): UseQueryOptions<FindBookChangeRequestsResponseBody, Error, FindBookChangeRequestsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => findBookChangeRequests(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });
