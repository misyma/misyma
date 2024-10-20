import { FC } from 'react';
import { DeleteUserBookModal } from '../deleteUserBookModal/deleteUserBookModal';
import { useQuery } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';

interface DeleteUserBookButtonProps {
  bookId: string;
}
export const DeleteUserBookButton: FC<DeleteUserBookButtonProps> = ({
  bookId,
}) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  return (
    <DeleteUserBookModal
      bookId={bookId}
      bookshelfId={data?.bookshelfId ?? ''}
      bookName={data?.book.title ?? ''}
    />
  );
};
