import { type FindAuthorsQueryParams, type FindAuthorsResponseBody, SortOrder } from '@common/contracts';

import { HttpService } from '../../../../../core/services/httpService/httpService';

type Payload = FindAuthorsQueryParams & {
  accessToken: string;
};

export const findAuthors = async (values: Payload) => {
  const { name, page, pageSize, ids, accessToken } = values;

  const query: Record<string, string> = {
    sortDate: SortOrder.desc,
  };

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

  if (ids && !name) {
    for (const id of ids) {
      customQueryAppend.push([`ids`, id]);
    }
  }

  await new Promise((res) => setTimeout(res, 2 * 1000));

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
