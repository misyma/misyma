import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { useQuery } from '@tanstack/react-query';
import { findBooksByBookshelfId } from './findBooksByBookshelfId';

type Payload = {
  bookshelfId: string;
  userId: string;
}

export const useFindBooksByBookshelfIdQuery = ({ bookshelfId, userId }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  return useQuery({
    queryKey: ['findBooksByBookshelfId', bookshelfId, userId],
    queryFn: () => findBooksByBookshelfId({ 
      bookshelfId,
      accessToken: accessToken as string,
      userId
    }),
    enabled: !!accessToken && !!bookshelfId,
  });
};
