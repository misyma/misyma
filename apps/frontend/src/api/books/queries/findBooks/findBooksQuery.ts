import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { findBooks } from './findBooks';

type Payload = {
  isbn?: string;
  title?: string;
} & Partial<UseQueryOptions>;

export const useFindBooksQuery = ({ isbn, title, ...rest }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  return useQuery({
    queryKey: ['findBooksQuery', isbn, title],
    queryFn: () =>
      findBooks({
        accessToken: accessToken as string,
        isbn,
        title,
      }),
    enabled: !!accessToken,
    ...rest,
  });
};
