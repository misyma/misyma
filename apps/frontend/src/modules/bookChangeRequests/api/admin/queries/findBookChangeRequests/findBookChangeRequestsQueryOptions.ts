import { type QueryKey, type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBookChangeRequestsQueryParams, type FindBookChangeRequestsResponseBody } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys';

const mapper = new ErrorCodeMessageMapper({});

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
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const FindBookChangeRequestsQueryOptions = (
  payload: FindBookChangeRequestsQueryParams,
): UseQueryOptions<FindBookChangeRequestsResponseBody, BookApiError, FindBookChangeRequestsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => findBookChangeRequests(payload),
    placeholderData: keepPreviousData,
  });

export const invalidateBookChangeRequestsQueryPredicate = (queryKey: QueryKey) =>
  queryKey.includes(BookChangeRequestApiAdminQueryKeys.findBookChangeRequests);
