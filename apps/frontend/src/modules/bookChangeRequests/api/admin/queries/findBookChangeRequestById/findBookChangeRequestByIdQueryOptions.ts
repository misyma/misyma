import { type QueryKey, type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBookChangeRequestPathParams, type FindAdminBookChangeRequestResponseBody } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError.js';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../../core/apiClient/apiClient.js';
import { BookChangeRequestApiAdminQueryKeys } from '../bookChangeRequestApiAdminQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

const findBookChangeRequests = async (payload: FindBookChangeRequestPathParams) => {
  const { bookChangeRequestId } = payload;

  const response = await api.get<FindAdminBookChangeRequestResponseBody>(
    `/admin/book-change-requests/${bookChangeRequestId}`,
  );

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const FindBookChangeRequestByIdQueryOptions = (
  payload: FindBookChangeRequestPathParams,
): UseQueryOptions<
  FindAdminBookChangeRequestResponseBody,
  BookApiError,
  FindAdminBookChangeRequestResponseBody,
  string[]
> =>
  queryOptions({
    queryKey: [BookChangeRequestApiAdminQueryKeys.findBookChangeRequests, `${payload.bookChangeRequestId}`],
    queryFn: () => findBookChangeRequests(payload),
    placeholderData: keepPreviousData,
  });

export const invalidateBookChangeRequestByIdQueryPredicate = (queryKey: QueryKey, bookChangeRequestId: string) =>
  queryKey.includes(BookChangeRequestApiAdminQueryKeys.findBookChangeRequestById) &&
  queryKey.includes(bookChangeRequestId);
