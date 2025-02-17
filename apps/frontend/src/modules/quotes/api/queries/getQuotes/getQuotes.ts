import { type FindQuotesQueryParams, type FindQuotesResponseBody } from '@common/contracts';

import { HttpService } from '../../../../core/services/httpService/httpService';

export const getQuotes = async (payload: FindQuotesQueryParams & { accessToken: string }) => {
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

  if (payload.sortDate) {
    queryParams.sortDate = payload.sortDate;
  } else {
    queryParams.sortDate = 'desc';
  }

  const response = await HttpService.get<FindQuotesResponseBody>({
    url: '/quotes',
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
    },
    queryParams,
  });

  if (!response.success) {
    throw new Error(); //todo: change to dedicated api error
  }

  return response.body;
};
