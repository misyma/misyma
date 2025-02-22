import {
  type UseQueryOptions,
  infiniteQueryOptions,
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type FindAuthorsResponseBody } from '@common/contracts';

import { findAuthors } from './findAuthors';
import { type ApiError } from '../../../../../common/errors/apiError';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { AuthorsApiQueryKeys } from '../authorsApiQueryKeys';

type Payload = {
  name?: string;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
} & Partial<Omit<UseQueryOptions<FindAuthorsResponseBody, ApiError>, 'queryFn'>>;

export const useFindAuthorsQuery = ({ name, all = false, page, pageSize, ids, ...options }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

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

  return useQuery({
    queryKey: [AuthorsApiQueryKeys.findAuthorsQuery, name, `${page}`, `${ids?.join(',')}`],
    queryFn: () =>
      findAuthors({
        accessToken: accessToken as string,
        name,
        page,
        ids,
        pageSize,
      }),
    enabled: !!accessToken && isEnabled(),
    ...options,
    placeholderData: keepPreviousData,
  });
};

type InfinitePayload = {
  accessToken: string;
  name?: string;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
};

const getAuthorsInfiniteQueryOptions = ({ accessToken, name, page, ids, pageSize }: InfinitePayload) =>
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
        accessToken: accessToken as string,
        name,
        page: pageParam as number,
        ids,
        pageSize,
      }),
    initialPageParam: page,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => {
      if (!lastPage) {
        return undefined;
      }

      if (lastPage.metadata.total === 0) {
        return undefined;
      }

      const totalPages = Math.ceil(lastPage.metadata.total / lastPage.metadata.pageSize);

      if (lastPage.metadata.page === totalPages) {
        return undefined;
      }

      return lastPage.metadata.page + 1;
    },
    getPreviousPageParam: (lastPage) => {
      if (lastPage.metadata.page > 1) {
        return lastPage.metadata.page - 1;
      }

      return undefined;
    },
    enabled: !!accessToken && (!name || name.length > 3),
  });

export const useFindAuthorsInfiniteQuery = (payload: InfinitePayload) => {
  return useInfiniteQuery(getAuthorsInfiniteQueryOptions(payload));
};
