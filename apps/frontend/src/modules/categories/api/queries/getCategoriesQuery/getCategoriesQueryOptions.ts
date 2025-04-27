import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindCategoriesQueryParams, type FindCategoriesResponseBody } from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError.js';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../core/apiClient/apiClient.js';
import { ApiPaths } from '../../../../core/apiClient/apiPaths.js';
import { CategoriesApiQueryKeys } from '../categoriesApiQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

const getCategories = async (payload: FindCategoriesQueryParams) => {
  const { page, pageSize = 200 } = payload;

  const queryParams: Record<string, string> = {};

  if (page) {
    queryParams.page = `${page}`;
  }

  if (pageSize) {
    queryParams.pageSize = `${pageSize}`;
  }

  const response = await api.get<FindCategoriesResponseBody>(ApiPaths.categories.path, {
    params: queryParams,
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const getCategoriesQueryOptions = (
  payload: FindCategoriesQueryParams,
): UseQueryOptions<FindCategoriesResponseBody, Error, FindCategoriesResponseBody, string[]> =>
  queryOptions({
    queryKey: [CategoriesApiQueryKeys.findCategories, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => getCategories(payload),
  });
