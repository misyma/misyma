import { type UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type FindAuthorsResponseBody } from '@common/contracts';

import { findAdminAuthors } from './findAdminAuthors.js';
import { type ApiError } from '../../../../../common/errors/apiError.js';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice.js';
import { AdminAuthorsApiQueryKeys } from '../adminAuthorsApiQueryKeys.js';

type Payload = {
  name?: string;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
} & Partial<Omit<UseQueryOptions<FindAuthorsResponseBody, ApiError>, 'queryFn'>>;

export const useFindAdminAuthorsQuery = ({ name, all = false, page, pageSize, ids, ...options }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

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

  return useQuery({
    queryKey: [AdminAuthorsApiQueryKeys.findAdminAuthorsQuery, name, `${page}`, `${ids?.join(',')}`],
    queryFn: () =>
      findAdminAuthors({
        accessToken: accessToken as string,
        name,
        page,
        ids,
        pageSize,
      }),
    enabled: !!accessToken && isEnabled(),
    ...options,
    placeholderData: keepPreviousData,
  });
};
