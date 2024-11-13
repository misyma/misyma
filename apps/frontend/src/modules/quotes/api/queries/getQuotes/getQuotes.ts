import { FindQuotesResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export interface GetQuotesPayload {
  userBookId: string;
  accessToken: string;
  page?: number;
  pageSize?: number;
}

export const getQuotes = async (payload: GetQuotesPayload) => {
  const queryParams: Record<string, string> = {};

  if (payload.page || payload.page === 0) {
    queryParams.page = `${payload.page}`;
  }

  if (payload.pageSize) {
    queryParams.pageSize = `${payload.pageSize}`;
  }

  queryParams.sortDate = 'desc';

  const response = await HttpService.get<FindQuotesResponseBody>({
    url: `/user-books/${payload.userBookId}/quotes`,
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
