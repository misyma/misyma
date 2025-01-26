import { keepPreviousData, useQuery, infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type FindBookshelvesQueryParams, type FindBookshelvesResponseBody } from '@common/contracts';

import { HttpService } from '../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

type Payload = FindBookshelvesQueryParams & {
  userId: string;
};

export const useFindUserBookshelfsQuery = (payload: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findUserBookshelfs = async () => {
    const { page, pageSize, name } = payload;

    const queryParams: Record<string, string> = {
      sortDate: 'desc',
    };

    if (page) {
      queryParams['page'] = `${page}`;
    }

    if (pageSize) {
      queryParams['pageSize'] = `${pageSize}`;
    }

    if (name) {
      queryParams['name'] = name;
    }

    const response = await HttpService.get<FindBookshelvesResponseBody>({
      url: '/bookshelves',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      queryParams,
    });

    if (response.success === false) {
      throw new Error('Error');
    }

    return response.body;
  };

  return useQuery<FindBookshelvesResponseBody>({
    queryKey: [BookshelvesApiQueryKeys.findUserBookshelfs, payload.page, payload.pageSize, payload.name],
    queryFn: () => findUserBookshelfs(),
    enabled: !!accessToken && !!payload.userId,
    placeholderData: keepPreviousData,
  });
};

export const findUserBookshelves = async (payload: {
  accessToken: string;
  page?: number;
  pageSize?: number;
  name?: string;
}) => {
  const { page, pageSize, name } = payload;

  const queryParams: Record<string, string> = {
    sortDate: 'desc',
  };

  if (page) queryParams['page'] = `${page}`;
  if (pageSize) queryParams['pageSize'] = `${pageSize}`;
  if (name) queryParams['name'] = name;

  const response = await HttpService.get<FindBookshelvesResponseBody>({
    url: '/bookshelves',
    headers: { Authorization: `Bearer ${payload.accessToken}` },
    queryParams,
  });

  if (!response.success) throw new Error('Failed to fetch bookshelves');
  return response.body;
};

export const FindUserBookshelvesInfiniteQueryOptions = ({
  accessToken,
  page = 1,
  pageSize,
  name,
}: {
  accessToken: string;
  page?: number;
  pageSize?: number;
  name?: string;
}) =>
  infiniteQueryOptions({
    queryKey: [
      BookshelvesApiQueryKeys.findUserBookshelfs,
      name,
      pageSize,
      'infinite-query', // Identifier for infinite queries
    ],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      findUserBookshelves({
        accessToken,
        page: pageParam,
        pageSize,
        name,
      }),
    getNextPageParam: (lastPage) => {
      console.log('XD');
      if (!lastPage?.metadata) return undefined;

      const { page: currentPage, total, pageSize } = lastPage.metadata;
      const totalPages = Math.ceil(total / pageSize);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!accessToken,
  });

type InfiniteQueryPayload = {
  pageSize?: number;
  name?: string;
  accessToken: string;
};

export const useFindUserBookshelfsInfiniteQuery = (payload: InfiniteQueryPayload) => {
  return useInfiniteQuery(
    FindUserBookshelvesInfiniteQueryOptions({
      accessToken: payload.accessToken,
      pageSize: payload.pageSize,
      name: payload.name,
    }),
  );
};

export const invalidateBookshelvesInfiniteQuery = (queryKey: Readonly<Array<unknown>>) => {
  return queryKey.includes('infinite-query') && queryKey.includes(BookshelvesApiQueryKeys.findUserBookshelfs);
};
