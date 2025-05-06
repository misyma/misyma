import { type QueryKey, type UseQueryOptions, keepPreviousData } from '@tanstack/react-query';

import {
  type FindAdminAuthorsQueryParams,
  SortOrder,
  FindAdminAuthorsResponseBody,
  sortOrders,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { type ApiError } from '../../../../../common/errors/apiError.js';
import { api } from '../../../../../core/apiClient/apiClient.js';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths.js';
import { AuthorApiError } from '../../../../errors/authorApiError.js';
import { AdminAuthorsApiQueryKeys } from '../adminAuthorsApiQueryKeys.js';
import { useErrorHandledQuery } from '../../../../../common/hooks/useErrorHandledQuery.js';

type Payload = {
  name?: string;
  isApproved?: boolean;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
  sortField?: FindAdminAuthorsQueryParams['sortField'] | undefined;
  sortOrder?: SortOrder | undefined;
} & Partial<Omit<UseQueryOptions<FindAdminAuthorsResponseBody, ApiError>, 'queryFn'>>;

const mapper = new ErrorCodeMessageMapper({});

export const findAdminAuthors = async (values: FindAdminAuthorsQueryParams) => {
  const { name, page, pageSize, ids, sortField, sortOrder, isApproved } = values;

  const query: Record<string, string> = {
    sortField: sortField || 'createdAt',
    sortOrder: sortOrder || sortOrders.desc,
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

  const response = await api.get<FindAdminAuthorsResponseBody>(ApiPaths.admin.authors.path, {
    params: query,
    paramsSerializer: (params) => {
      const queryString = new URLSearchParams(params);
      if (ids) {
        for (const id of ids) {
          queryString.append('ids', id);
        }
      }
      return queryString.toString();
    },
    errorCtor: AuthorApiError,
    mapper
  });

  return response.data;
};

export const useFindAdminAuthorsQuery = ({
  name,
  isApproved,
  all = false,
  page,
  pageSize,
  ids,
  sortField,
  sortOrder,
  ...options
}: Payload) => {
  const isEnabled = () => {
    if (all) {
      return true;
    }

    if (ids && (ids as Array<unknown>)?.length > 0) {
      return true;
    }

    if (!name) {
      return false;
    }

    return name?.length >= 3;
  };

  return useErrorHandledQuery({
    queryKey: [
      AdminAuthorsApiQueryKeys.findAdminAuthorsQuery,
      name,
      `${page}`,
      `${ids?.join(',')}`,
      sortField,
      sortOrder,
      isApproved,
    ],
    queryFn: () =>
      findAdminAuthors({
        name,
        page,
        ids,
        pageSize,
        sortField,
        sortOrder,
        isApproved,
      }),
    enabled: isEnabled(),
    ...options,
    placeholderData: keepPreviousData,
  });
};

export const invalidateAdminAuthorsQueryPredicate = (queryKey: QueryKey) =>
  queryKey.includes(AdminAuthorsApiQueryKeys.findAdminAuthorsQuery);
