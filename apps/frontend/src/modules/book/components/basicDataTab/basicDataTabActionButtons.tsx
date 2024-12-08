import { FC } from 'react';
import { BorrowBookButton } from './borrowBookButton';
import { EditBookModal } from '../editBookModal/editBookModal';
import { DeleteUserBookButton } from './deleteUserBookButton';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useQuery } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';

interface BasicDataTabActionButtonsProps {
  bookId: string;
}
export const BasicDataTabActionButtons: FC<BasicDataTabActionButtonsProps> = ({
  bookId,
}) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data } = useFindUserQuery();

  const { data: userBookData } = useQuery(
    FindUserBookByIdQueryOptions({
      accessToken,
      userBookId: bookId,
      userId: data?.id as string,
    })
  );

  return (
    <div className="flex gap-4 p-2">
      <BorrowBookButton
        currentBookshelfId={userBookData?.bookshelfId as string}
        bookId={bookId}
      />
      <EditBookModal bookId={bookId} />
      <DeleteUserBookButton bookId={bookId} />
    </div>
  );
};
