import { type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindAdminBookChangeRequestResponseBody } from '@common/contracts';

import { findBookChangeRequests, type FindBookChangeRequestByIdPayload } from './findBookChangeRequestById.js';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys.js';

export const FindBookChangeRequestByIdQueryOptions = (
  payload: FindBookChangeRequestByIdPayload,
): UseQueryOptions<FindAdminBookChangeRequestResponseBody, Error, FindAdminBookChangeRequestResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.bookChangeRequestId}`],
    queryFn: () => findBookChangeRequests(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });
