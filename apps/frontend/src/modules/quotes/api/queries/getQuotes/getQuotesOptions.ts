import { type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindQuotesResponseBody } from '@common/contracts';

import { type GetQuotesPayload, getQuotes } from './getQuotes';
import { QuotesApiQueryKeys } from '../quotesApiQueryKeys';

export const getQuotesOptions = (
  payload: GetQuotesPayload,
): UseQueryOptions<FindQuotesResponseBody, Error, FindQuotesResponseBody, string[]> =>
  queryOptions({
    queryKey: [...getQuotesOptionsQueryKey(payload), `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => getQuotes(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData,
  });

export const getQuotesOptionsQueryKey = (payload: Pick<GetQuotesPayload, 'userBookId'>): string[] => [
  QuotesApiQueryKeys.findQuotes,
  payload.userBookId,
];
