import { UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';
import { findBookChangeRequests, FindBookChangeRequestByIdPayload } from './findBookChangeRequestById.js';
import { FindAdminBookChangeRequestByIdResponseBody } from '@common/contracts';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys.js';

export const FindBookChangeRequestByIdQueryOptions = (
  payload: FindBookChangeRequestByIdPayload,
): UseQueryOptions<FindAdminBookChangeRequestByIdResponseBody, Error, FindAdminBookChangeRequestByIdResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.id}`],
    queryFn: () => findBookChangeRequests(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });
