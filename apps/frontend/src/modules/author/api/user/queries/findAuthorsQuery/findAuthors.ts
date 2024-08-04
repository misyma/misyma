import { FindAuthorsQueryParams, FindAuthorsResponseBody } from '@common/contracts';
import { HttpService } from '../../../../../core/services/httpService/httpService';

type Payload = FindAuthorsQueryParams & {
  accessToken: string;
};

export const findAuthors = async (values: Payload) => {
  const { name, page, pageSize, ids, accessToken } = values;

  const query: Record<string, string> = {};

  if (name) {
    query.name = name;
  }

  if (page) {
    query.page = `${page}`;
  }

  if (pageSize) {
    query.pageSize = `${pageSize}`;
  }

  const customQueryAppend: Array<[string, string]> = [];

  if (ids) {
    for (const id of ids) {
      customQueryAppend.push([`ids`, id]);
    }
  }

  const response = await HttpService.get<FindAuthorsResponseBody>({
    url: '/authors',
    queryParams: query,
    customQueryAppend,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error('Error');
  }

  return response.body;
};
