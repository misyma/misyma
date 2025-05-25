import {
  type QueryKey,
  type UseQueryOptions,
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query';

import { type FindQuotesQueryParams, type FindQuotesResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../core/apiClient/apiClient.js';
import { ApiPaths } from '../../../../core/apiClient/apiPaths.js';
import { QuoteApiError } from '../../errors/quoteApiError.js';
import { QuotesApiQueryKeys } from '../quotesApiQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

export const getQuotes = async (payload: FindQuotesQueryParams) => {
  const queryParams: Record<string, string> = {};

  if (payload.userBookId) {
    queryParams.userBookId = payload.userBookId;
  }

  if (payload.page || payload.page === 0) {
    queryParams.page = `${payload.page}`;
  }

  if (payload.pageSize) {
    queryParams.pageSize = `${payload.pageSize}`;
  }

  if (payload.authorId) {
    queryParams.authorId = payload.authorId;
  }

  if (payload.userBookId) {
    queryParams.userBookId = payload.userBookId;
  }

  if (payload.isFavorite) {
    queryParams.isFavorite = 'true';
  }

  if (payload.content) {
    queryParams.content = payload.content;
  }

  if (payload.sortDate) {
    queryParams.sortDate = payload.sortDate;
  } else {
    queryParams.sortDate = 'desc';
  }

  const response = await api.get<FindQuotesResponseBody>(ApiPaths.quotes.path, {
    params: queryParams,
    errorCtor: QuoteApiError,
    mapper,
  });

  return response.data;
};

export const getQuotesOptions = (
  payload: FindQuotesQueryParams,
): UseQueryOptions<FindQuotesResponseBody, QuoteApiError, FindQuotesResponseBody, string[]> =>
  queryOptions({
    queryKey: [...getQuotesOptionsQueryKey(payload), `${payload.page}`, `${payload.pageSize}`, `${payload.sortDate}`],
    queryFn: () => getQuotes(payload),
    placeholderData: keepPreviousData,
  });

export const getQuotesByInfiniteQueryOptions = ({ page = 1, ...payload }: FindQuotesQueryParams) =>
  infiniteQueryOptions({
    queryKey: [
      'infinite-query',
      ...getQuotesOptionsQueryKey(payload),
      `${page}`,
      `${payload.pageSize}`,
      `${payload.sortDate}`,
    ],
    initialPageParam: page,
    queryFn: ({ pageParam }) =>
      getQuotes({
        ...payload,
        page: pageParam,
      }),
    getNextPageParam: api.getNextPageParam,
    getPreviousPageParam: api.getPreviousPageParam,
  });

export const invalidateQuotesPredicate = (queryKey: QueryKey, userBookId: string) => {
  return queryKey.includes(QuotesApiQueryKeys.findQuotes) && queryKey[1] === userBookId;
};

export const invalidateInfiniteQuotesPredicate = (queryKey: QueryKey) => {
  return queryKey[0] === 'infinite-query' && queryKey[1] === QuotesApiQueryKeys.findQuotes;
};

export const invalidateAllQuotesPredicate = (queryKey: QueryKey) => {
  return queryKey[0] === QuotesApiQueryKeys.findQuotes;
};

export const getQuotesOptionsQueryKey = (payload: FindQuotesQueryParams): string[] => [
  QuotesApiQueryKeys.findQuotes,
  payload?.userBookId ?? '',
  payload.authorId ?? '',
  payload.content ?? '',
  `${payload.isFavorite}`,
  `${payload.sortDate}`,
];

export const invalidateQuotesQueries = (queryKey: QueryKey, userBookId: string) =>
  invalidateQuotesPredicate(queryKey, userBookId) || invalidateInfiniteQuotesPredicate(queryKey);
