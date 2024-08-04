import { FindAuthorsResponseBody } from '@common/contracts';
import { UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { findAuthors } from './findAuthors';
import { ApiError } from '../../../../../common/errors/apiError';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { AuthorsApiQueryKeys } from '../authorsApiQueryKeys';

type Payload = {
  name?: string;
  all?: boolean;
  ids?: string[];
  page?: number;
  pageSize?: number;
} & Partial<Omit<UseQueryOptions<FindAuthorsResponseBody, ApiError>, 'queryFn'>>;

export const useFindAuthorsQuery = ({ name, all = false, page, pageSize, ids, ...options }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  return useQuery({
    queryKey: [AuthorsApiQueryKeys.findAuthorsQuery, name, `${page}`, `${ids?.join(',')}`],
    queryFn: () =>
      findAuthors({
        accessToken: accessToken as string,
        name,
        page,
        ids,
        pageSize,
      }),
    enabled: !!accessToken && (!!name || all || !!ids),
    ...options,
    placeholderData: keepPreviousData,
  });
};
