import { type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

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

export const getQuotesOptionsQueryKey = (payload: FindQuotesQueryParams): string[] => [
  QuotesApiQueryKeys.findQuotes,
  payload?.userBookId ?? '',
  payload.authorId ?? '',
  `${payload.isFavorite}`,
  `${payload.sortDate}`,
];
