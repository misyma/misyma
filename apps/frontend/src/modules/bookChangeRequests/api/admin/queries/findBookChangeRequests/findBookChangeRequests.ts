import { type FindBookChangeRequestsQueryParams, type FindBookChangeRequestsResponseBody } from '@common/contracts';

import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface FindBookChangeRequestsPayload extends FindBookChangeRequestsQueryParams {
  accessToken: string;
}

export const findBookChangeRequests = async (payload: FindBookChangeRequestsPayload) => {
  const { accessToken, page, pageSize } = payload;

  const query: Record<string, string> = {};

  if (pageSize) {
    query.pageSize = `${pageSize}`;
  }

  if (page) {
    query.page = `${page}`;
  }

  const response = await HttpService.get<FindBookChangeRequestsResponseBody>({
    url: '/admin/book-change-requests',
    queryParams: query,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error('Error');
  }

  return response.body;
};
