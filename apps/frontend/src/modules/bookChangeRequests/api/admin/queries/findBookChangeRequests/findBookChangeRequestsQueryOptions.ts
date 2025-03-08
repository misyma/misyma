import { type QueryKey, type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBookChangeRequestsQueryParams, type FindBookChangeRequestsResponseBody } from '@common/contracts';

import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys';

export const findBookChangeRequests = async (payload: FindBookChangeRequestsQueryParams) => {
  const { page, pageSize } = payload;

  const query: Record<string, string> = {};
  if (pageSize) {
    query.pageSize = `${pageSize}`;
  }
  if (page) {
    query.page = `${page}`;
  }

  const response = await api.get<FindBookChangeRequestsResponseBody>(ApiPaths.admin.bookChangeRequest.path, {
    params: query,
  });

  if (api.isErrorResponse(response)) {
    throw new Error('Error'); // todo: dedicated error
  }

  return response.data;
};

export const FindBookChangeRequestsQueryOptions = (
  payload: FindBookChangeRequestsQueryParams,
): UseQueryOptions<FindBookChangeRequestsResponseBody, Error, FindBookChangeRequestsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => findBookChangeRequests(payload),
    placeholderData: keepPreviousData,
  });

export const invalidateBookChangeRequestsQueryPredicate = (queryKey: QueryKey) =>
  queryKey.includes(BookChangeRequestApiAdminQueryKeys.findBookChangeRequests);
