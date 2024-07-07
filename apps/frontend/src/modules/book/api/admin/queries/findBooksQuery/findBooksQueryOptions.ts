import { UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { ApiError } from '../../../../../common/errors/apiError';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { BookApiQueryKeys } from '../../../user/queries/bookApiQueryKeys';
import { findBooks } from './findBooks';
import { FindBooksResponseBody } from '@common/contracts';

type Payload = {
  title?: string;
  all?: boolean;
  page?: number;
} & Partial<Omit<UseQueryOptions<FindBooksResponseBody, ApiError>, 'queryFn'>>;

export const useFindBooksQuery = ({ title, all = false, page, ...options }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  return useQuery({
    queryKey: [BookApiQueryKeys.findBooksAdmin, title, `${page}`],
    queryFn: () =>
      findBooks({
        accessToken: accessToken as string,
        title,
        page,
      }),
    enabled: !!accessToken && (!!title || all),
    ...options,
    placeholderData: keepPreviousData,
  });
};
