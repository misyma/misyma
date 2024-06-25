import {
  FindBookReadingsPathParams,
  FindBookReadingsQueryParams,
  FindBookReadingsResponseBody,
} from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export type FindBookReadingsPayload = FindBookReadingsPathParams &
  FindBookReadingsQueryParams & {
    accessToken: string;
  };

export const findBookReadings = async (values: FindBookReadingsPayload): Promise<FindBookReadingsResponseBody> => {
  const { accessToken, userBookId, page, pageSize } = values;

  const queryParams: Record<string, string> = {};

  if (page) {
    queryParams['page'] = `${page + 1}`;
  }

  if (pageSize) {
    queryParams['pageSize'] = `${pageSize}`;
  }

  const response = await HttpService.get<FindBookReadingsResponseBody>({
    url: `/user-books/${userBookId}/readings`,
    queryParams,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(`Error`);
  }

  return response.body;
};
