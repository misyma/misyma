import { FindAuthorsResponseBody } from '@common/contracts';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { ApiError } from '../../../../modules/common/errors/apiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { findAuthors } from './findAuthors';

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
