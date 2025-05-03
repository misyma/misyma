import { type QueryKey, type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  type FindBookReadingsResponseBody,
  type FindBookReadingsPathParams,
  type FindBookReadingsQueryParams,
} from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { BookReadingsApiQueryKeys } from '../bookReadingsApiQueryKeys';

export type FindBookReadingsPayload = FindBookReadingsPathParams & FindBookReadingsQueryParams;

const mapper = new ErrorCodeMessageMapper({});

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
  const resolvedPath = path.replace('{{userBookId}}', userBookId);
  const response = await api.get(resolvedPath, {
    params: queryParams,
    errorCtor: BookApiError,
    mapper,
  });

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
