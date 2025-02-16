import { type UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import {
  type FindBooksResponseBody,
  type FindAdminBooksQueryParams,
  SortOrder,
  FindAdminBooksSortField,
} from '@common/contracts';

import { adminFindBooks } from './findBooks';
import { type ApiError } from '../../../../../common/errors/apiError';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { BookApiQueryKeys } from '../../../user/queries/bookApiQueryKeys';

type Payload = FindAdminBooksQueryParams & {
  all: boolean;
} & Partial<Omit<UseQueryOptions<FindBooksResponseBody, ApiError>, 'queryFn'>>;

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
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

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
        accessToken: accessToken as string,
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
    enabled: !!accessToken && (!!title || all),
    ...options,
    placeholderData: keepPreviousData,
  });
};
