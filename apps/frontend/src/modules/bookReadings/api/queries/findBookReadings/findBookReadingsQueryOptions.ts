import { type QueryKey, type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  type FindBookReadingsResponseBody,
  type FindBookReadingsPathParams,
  type FindBookReadingsQueryParams,
} from '@common/contracts';

import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { BookReadingsApiQueryKeys } from '../bookReadingsApiQueryKeys';

export type FindBookReadingsPayload = FindBookReadingsPathParams & FindBookReadingsQueryParams;

export const findBookReadings = async (values: FindBookReadingsPayload): Promise<FindBookReadingsResponseBody> => {
  const { userBookId, page, pageSize, sortDate } = values;

  const queryParams: Record<string, string> = {};
  if (page) {
    queryParams['page'] = `${page}`;
  }
  if (pageSize) {
    queryParams['pageSize'] = `${pageSize}`;
  }
  if (sortDate) {
    queryParams['sortDate'] = `${sortDate}`;
  }

  const path = ApiPaths.userBooks.$userBookId.readings.path;
  const resolvedPath = path.replace(ApiPaths.userBooks.$userBookId.params.userBookId, userBookId);
  const response = await api.get<FindBookReadingsResponseBody>(resolvedPath, {
    params: queryParams,
  });

  if (api.isErrorResponse(response)) {
    throw new Error(`Error`); // todo: dedicated error
  }

  return response.data;
};

export const FindBookReadingsQueryOptions = (
  payload: FindBookReadingsPayload,
): UseQueryOptions<FindBookReadingsResponseBody, Error, FindBookReadingsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BookReadingsApiQueryKeys.findBookReadings, payload.userBookId, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => findBookReadings(payload),
    placeholderData: keepPreviousData,
  });

export const invalidateBookReadingsQueryPredicate = (queryKey: QueryKey, userBookId: string) =>
  queryKey.includes(BookReadingsApiQueryKeys.findBookReadings) && queryKey.includes(userBookId);
