import { FindQuotesResponseBody } from '@common/contracts';
import { UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';
import { GetQuotesPayload, getQuotes } from './getQuotes';

export const getQuotesOptions = (
  payload: GetQuotesPayload,
): UseQueryOptions<FindQuotesResponseBody, Error, FindQuotesResponseBody, string[]> =>
  queryOptions({
    queryKey: [...getQuotesOptionsQueryKey(payload), payload.userId, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => getQuotes(payload),
    enabled: !!payload.accessToken,
    placeholderData: keepPreviousData<FindQuotesResponseBody>,
  });

export const getQuotesOptionsQueryKey = (payload: Pick<GetQuotesPayload, 'userBookId'>): string[] => [
  `findQuotes`,
  payload.userBookId,
];
