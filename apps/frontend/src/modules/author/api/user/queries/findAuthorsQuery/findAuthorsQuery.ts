import {
  type UseQueryOptions,
  infiniteQueryOptions,
  keepPreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { type FindAuthorsQueryParams, sortOrders, type FindAuthorsResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { AuthorApiError } from '../../../../errors/authorApiError';
import { AuthorsApiQueryKeys } from '../authorsApiQueryKeys';
import { useErrorHandledQuery } from '../../../../../common/hooks/useErrorHandledQuery';

type Payload = {
  name?: string;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
} & Partial<Omit<UseQueryOptions<FindAuthorsResponseBody, ApiError>, 'queryFn'>>;

const mapper = new ErrorCodeMessageMapper({});

export const findAuthors = async (values: FindAuthorsQueryParams) => {
  const { name, page, pageSize, ids } = values;

  const query: Record<string, string> = {
    sortDate: sortOrders.desc,
  };
  if (name) {
    query.name = name;
  }
  if (page) {
    query.page = `${page}`;
  }
  if (pageSize) {
    query.pageSize = `${pageSize}`;
  }

  const customQueryAppend: Array<[string, string]> = [];

  if (ids && !name) {
    for (const id of ids) {
      customQueryAppend.push([`ids`, id]);
    }
  }

  const response = await api.get<FindAuthorsResponseBody>(ApiPaths.authors.path, {
    params: query,
    paramsSerializer: (params) => {
      const queryString = new URLSearchParams(params);
      if (ids) {
        for (const id of ids) {
          queryString.append('ids', id);
        }
      }
      return queryString.toString();
    },
    errorCtor: AuthorApiError,
    mapper,
  });

  return response.data;
};

export const useFindAuthorsQuery = ({ name, all = false, page, pageSize, ids, ...options }: Payload) => {
  const isEnabled = () => {
    if (all) {
      return true;
    }

    if (ids && (ids as Array<unknown>)?.length > 0) {
      return true;
    }

    if (!name) {
      return false;
    }

    return name?.length >= 3;
  };

  return useErrorHandledQuery({
    queryKey: [AuthorsApiQueryKeys.findAuthorsQuery, name, `${page}`, `${ids?.join(',')}`],
    queryFn: () =>
      findAuthors({
        name,
        page,
        ids,
        pageSize,
      }),
    enabled: isEnabled(),
    ...options,
    placeholderData: keepPreviousData,
  });
};

type InfinitePayload = {
  name?: string;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
};

const getAuthorsInfiniteQueryOptions = ({ name, page, ids, pageSize }: InfinitePayload) =>
  infiniteQueryOptions({
    queryKey: [
      AuthorsApiQueryKeys.findAuthorsQuery,
      'infinite-query',
      name,
      `${page}`,
      `${pageSize}`,
      `${ids?.join(',')}`,
    ],
    queryFn: ({ pageParam }) =>
      findAuthors({
        name,
        page: pageParam as number,
        ids,
        pageSize,
      }),
    initialPageParam: page,
    placeholderData: keepPreviousData,
    getNextPageParam: api.getNextPageParam,
    getPreviousPageParam: api.getPreviousPageParam,
    enabled: !name || name.length > 3,
  });

export const useFindAuthorsInfiniteQuery = (payload: InfinitePayload) => {
  return useInfiniteQuery(getAuthorsInfiniteQueryOptions(payload));
};
