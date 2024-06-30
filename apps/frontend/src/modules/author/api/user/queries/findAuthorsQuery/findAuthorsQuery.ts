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
  page?: number;
} & Partial<Omit<UseQueryOptions<FindAuthorsResponseBody, ApiError>, 'queryFn'>>;

export const useFindAuthorsQuery = ({ name, all = false, page, ...options }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  return useQuery({
    queryKey: [AuthorsApiQueryKeys.findAuthorsQuery, name, `${page}`],
    queryFn: () =>
      findAuthors({
        accessToken: accessToken as string,
        name,
        page,
      }),
    enabled: !!accessToken && (!!name || all),
    ...options,
    placeholderData: keepPreviousData,
  });
};
