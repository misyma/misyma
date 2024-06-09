import { FindAuthorsResponseBody } from '@common/contracts';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { findAuthors } from './findAuthors';
import { ApiError } from '../../../../common/errors/apiError';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';

type Payload = {
  name?: string;
} & Partial<Omit<UseQueryOptions<FindAuthorsResponseBody, ApiError>, 'queryFn'>>;

export const useFindAuthorsQuery = ({ name, ...options }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  return useQuery({
    queryKey: ['findAuthorsQuery', name],
    queryFn: () =>
      findAuthors({
        accessToken: accessToken as string,
        name,
      }),
    enabled: !!accessToken && !!name,
    ...options,
  });
};
