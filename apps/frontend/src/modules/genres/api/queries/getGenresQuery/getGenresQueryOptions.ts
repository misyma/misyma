import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindGenresQueryParams, type FindGenresResponseBody } from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError.js';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../core/apiClient/apiClient.js';
import { ApiPaths } from '../../../../core/apiClient/apiPaths.js';
import { GenresApiQueryKeys } from '../genresApiQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

const getGenres = async (payload: FindGenresQueryParams) => {
  const { page, pageSize = 200 } = payload;

  const queryParams: Record<string, string> = {};

  if (page) {
    queryParams.page = `${page}`;
  }

  if (pageSize) {
    queryParams.pageSize = `${pageSize}`;
  }

  const response = await api.get<FindGenresResponseBody>(ApiPaths.genres.path, {
    params: queryParams,
  });

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const getGenresQueryOptions = (
  payload: FindGenresQueryParams,
): UseQueryOptions<FindGenresResponseBody, Error, FindGenresResponseBody, string[]> =>
  queryOptions({
    queryKey: [GenresApiQueryKeys.findGenres, `${payload.page}`, `${payload.pageSize}`],
    queryFn: () => getGenres(payload),
  });
