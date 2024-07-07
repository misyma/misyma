import { FindBooksQueryParams, FindBooksResponseBody } from '@common/contracts';
import { HttpService } from '../../../../../core/services/httpService/httpService';

type Payload = FindBooksQueryParams & {
  accessToken: string;
};

export const findBooks = async (values: Payload) => {
  const { title, page, pageSize, accessToken } = values;

  const query: Record<string, string> = {};

  if (title) {
    query.title = title;
  }

  if (page) {
    query.page = `${page + 1}`;
  }

  if (pageSize) {
    query.pageSize = `${pageSize}`;
  }

  const response = await HttpService.get<FindBooksResponseBody>({
    url: '/admin/books',
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
