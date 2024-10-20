import { useQuery } from '@tanstack/react-query';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../common/contexts/breadcrumbKeysContext';
import { FindUserBookByIdQueryOptions } from '../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useFindBookshelfByIdQuery } from '../../bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { useFindUserQuery } from '../../user/api/queries/findUserQuery/findUserQuery';
import { useEffect } from 'react';

interface UseBookBreadcrumbsProps {
  bookId: string;
}
export const useBookBreadcrumbs = ({ bookId }: UseBookBreadcrumbsProps) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const dispatch = useBreadcrumbKeysDispatch();
  const breadcrumbKeys = useBreadcrumbKeysContext();
  const { data: userData } = useFindUserQuery();
  const { data: userBookData } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );
  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(
    userBookData?.bookshelfId as string
  );

  useEffect(() => {
    if (userBookData && bookshelfResponse) {
      const updates = [
        { key: '$bookName', value: userBookData.book.title },
        { key: '$bookId', value: bookId },
        { key: '$bookshelfName', value: bookshelfResponse.name },
        { key: '$bookshelfId', value: userBookData.bookshelfId },
      ];

      updates.forEach(({ key, value }) => {
        if (value && !breadcrumbKeys[key]) {
          dispatch({ key, value });
        }
      });
    }
  }, [userBookData, bookshelfResponse, bookId, dispatch, breadcrumbKeys]);
};
