import { type UseQueryOptions, infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindQuotesQueryParams, type FindQuotesResponseBody } from '@common/contracts';

import { getQuotes } from './getQuotes';
import { QuotesApiQueryKeys } from '../quotesApiQueryKeys';

export const getQuotesOptions = (
  payload: FindQuotesQueryParams & { accessToken: string },
): UseQueryOptions<FindQuotesResponseBody, Error, FindQuotesResponseBody, string[]> =>
  queryOptions({
    queryKey: [...getQuotesOptionsQueryKey(payload), `${payload.page}`, `${payload.pageSize}`, `${payload.sortDate}`],
    queryFn: () => getQuotes(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });

export const getQuotesByInfiniteQueryOptions = ({
  page = 1,
  ...payload
}: FindQuotesQueryParams & { accessToken: string }) =>
  infiniteQueryOptions({
    queryKey: [...getQuotesOptionsQueryKey(payload), `${page}`, `${payload.pageSize}`, `${payload.sortDate}`],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      getQuotes({
        ...payload,
        page: pageParam,
      }),
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
    enabled: !!payload.accessToken,
  });

export const getQuotesOptionsQueryKey = (payload: FindQuotesQueryParams): string[] => [
  QuotesApiQueryKeys.findQuotes,
  payload?.userBookId ?? '',
  payload.authorId ?? '',
  `${payload.isFavorite}`,
  `${payload.sortDate}`,
];
