import {
  keepPreviousData,
  useQuery,
  infiniteQueryOptions,
  useInfiniteQuery,
  type QueryKey,
} from '@tanstack/react-query';

import { type FindBookshelvesQueryParams, type FindBookshelvesResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

type Payload = FindBookshelvesQueryParams;

export const useFindUserBookshelfsQuery = (payload: Payload) => {
  return useQuery<FindBookshelvesResponseBody>({
    queryKey: [BookshelvesApiQueryKeys.findUserBookshelfs, payload.page, payload.pageSize, payload.name],
    queryFn: () => findUserBookshelves(payload),
    placeholderData: keepPreviousData,
  });
};

const mapper = new ErrorCodeMessageMapper({});

export const findUserBookshelves = async (payload: Payload) => {
  const { page, pageSize, name } = payload;

  const queryParams: Record<string, string> = {
    sortDate: 'desc',
  };

  if (page) queryParams['page'] = `${page}`;
  if (pageSize) queryParams['pageSize'] = `${pageSize}`;
  if (name) queryParams['name'] = name;

  const response = await api.get<FindBookshelvesResponseBody>(ApiPaths.bookshelves.path, {
    params: queryParams,
  });

  api.validateResponse(response, ShelfApiError, mapper);

  return response.data;
};

export const FindUserBookshelvesInfiniteQueryOptions = ({
  page = 1,
  pageSize,
  name,
}: {
  page?: number;
  pageSize?: number;
  name?: string;
}) =>
  infiniteQueryOptions({
    queryKey: [BookshelvesApiQueryKeys.findUserBookshelfs, name, pageSize, 'infinite-query'],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      findUserBookshelves({
        page: pageParam,
        pageSize,
        name,
      }),
    getNextPageParam: api.getNextPageParam,
    getPreviousPageParam: api.getPreviousPageParam,
  });

type InfiniteQueryPayload = {
  pageSize?: number;
  name?: string;
};

export const useFindUserBookshelfsInfiniteQuery = (payload: InfiniteQueryPayload) => {
  return useInfiniteQuery(
    FindUserBookshelvesInfiniteQueryOptions({
      pageSize: payload.pageSize,
      name: payload.name,
    }),
  );
};

export const invalidateBookshelvesInfiniteQueryPredicate = (queryKey: QueryKey) =>
  queryKey.includes('infinite-query') && queryKey.includes(BookshelvesApiQueryKeys.findUserBookshelfs);

export const invalidateBookshelvesQueryPredicate = (queryKey: QueryKey) =>
  queryKey.includes(BookshelvesApiQueryKeys.findUserBookshelfs);

export const invalidateBookshelvesQueriesPredicate = (queryKey: QueryKey) =>
  invalidateBookshelvesInfiniteQueryPredicate(queryKey) || invalidateBookshelvesQueryPredicate(queryKey);
