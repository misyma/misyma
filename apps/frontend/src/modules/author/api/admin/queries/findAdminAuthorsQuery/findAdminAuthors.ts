import {
  type FindAdminAuthorsQueryParams,
  type FindAuthorsResponseBody,
  FindAuthorsSortField,
  SortOrder,
} from '@common/contracts';

import { HttpService } from '../../../../../core/services/httpService/httpService.js';

type Payload = FindAdminAuthorsQueryParams & {
  accessToken: string;
};

export const findAdminAuthors = async (values: Payload) => {
  const { name, page, pageSize, ids, accessToken, sortField, sortOrder, isApproved } = values;

  const query: Record<string, string> = {
    sortField: sortField || FindAuthorsSortField.createdAt,
    sortOrder: sortOrder || SortOrder.desc,
  };

  if (name) {
    query.name = name;
  }

  if (isApproved !== undefined) {
    query.isApproved = `${isApproved}`;
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

  const response = await HttpService.get<FindAuthorsResponseBody>({
    url: '/admin/authors',
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
