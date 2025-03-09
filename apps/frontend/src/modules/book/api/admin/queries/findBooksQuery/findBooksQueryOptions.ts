import { type UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  type FindBooksResponseBody,
  type FindAdminBooksQueryParams,
  SortOrder,
  FindAdminBooksSortField,
} from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiError } from '../../../../../common/errors/apiError';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../../user/queries/bookApiQueryKeys';

type Payload = FindAdminBooksQueryParams & {
  all: boolean;
} & Partial<Omit<UseQueryOptions<FindBooksResponseBody, ApiError>, 'queryFn'>>;

type RequestPayload = FindAdminBooksQueryParams & {
  signal: AbortSignal;
};

const mapper = new ErrorCodeMessageMapper({});

export const adminFindBooks = async (values: RequestPayload) => {
  const { title, page, pageSize, signal, ...remaining } = values;

  const query: Record<PropertyKey, string> = {};
  if (title) {
    query.title = title;
  }
  if (page) {
    query.page = `${page}`;
  }
  if (pageSize) {
    query.pageSize = `${pageSize}`;
  }

  Object.entries(remaining).forEach(([key, val]) => {
    if (val === undefined || val === '') {
      return;
    }

    if (val === 0) {
      return;
    }

    if (Array.isArray(val)) {
      return (query[key] = val.join(','));
    }
    // eslint-disable-next-line
    if ((val as any) instanceof Date) {
      query[key] = (val as unknown as Date).getFullYear().toString();

      return;
    }

    query[key] = `${val}`;
  });

  const response = await api.get<FindBooksResponseBody>(ApiPaths.admin.books.path, {
    params: query,
    signal,
  });

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const useAdminFindBooksQuery = ({
  title,
  all = false,
  page,
  pageSize = 10,
  authorIds,
  language,
  isApproved,
  releaseYearBefore,
  releaseYearAfter,
  isbn,
  sortField = FindAdminBooksSortField.createdAt,
  sortOrder = SortOrder.desc,
  ...options
}: Payload) => {
  return useQuery({
    queryKey: [
      BookApiQueryKeys.findBooksAdmin,
      title,
      `${page}`,
      Array.isArray(authorIds) ? authorIds?.join(',') : authorIds,
      isbn,
      language,
      isApproved,
      releaseYearBefore,
      releaseYearAfter,
      sortField,
      sortOrder,
    ],
    queryFn: ({ signal }) =>
      adminFindBooks({
        title,
        page,
        pageSize,
        authorIds,
        isApproved,
        isbn,
        language,
        releaseYearAfter,
        releaseYearBefore,
        sortField,
        sortOrder,
        signal,
      }),
    enabled: !!title || all,
    ...options,
    placeholderData: keepPreviousData,
  });
};
