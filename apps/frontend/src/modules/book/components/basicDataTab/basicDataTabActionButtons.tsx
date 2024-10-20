import { FC } from 'react';
import { BorrowBookButton } from './borrowBookButton';
import { EditBookModal } from '../editBookModal/editBookModal';
import { DeleteUserBookButton } from './deleteUserBookButton';

interface BasicDataTabActionButtonsProps {
  bookId: string;
}
export const BasicDataTabActionButtons: FC<BasicDataTabActionButtonsProps> = ({
  bookId,
}) => {
  return (
    <div className="flex gap-4 p-2">
      <BorrowBookButton bookId={bookId} />
      <EditBookModal bookId={bookId} />
      <DeleteUserBookButton bookId={bookId} />
    </div>
  );
};
