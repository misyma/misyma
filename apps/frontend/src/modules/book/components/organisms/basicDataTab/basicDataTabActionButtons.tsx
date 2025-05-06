import { type FC } from 'react';

import { BorrowBookButton } from './borrowBookButton';
import { DeleteUserBookButton } from './deleteUserBookButton';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { EditBookModal } from '../editBookModal/editBookModal';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';

interface BasicDataTabActionButtonsProps {
  bookId: string;
}
export const BasicDataTabActionButtons: FC<BasicDataTabActionButtonsProps> = ({ bookId }) => {
  const { data: userBookData } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
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
