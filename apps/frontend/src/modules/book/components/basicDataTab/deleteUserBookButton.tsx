import { type FC } from 'react';

import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { DeleteUserBookModal } from '../deleteUserBookModal/deleteUserBookModal';

interface DeleteUserBookButtonProps {
  bookId: string;
}
export const DeleteUserBookButton: FC<DeleteUserBookButtonProps> = ({ bookId }) => {
  const { data } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  return (
    <DeleteUserBookModal
      bookId={bookId}
      bookshelfId={data?.bookshelfId ?? ''}
      bookName={data?.book.title ?? ''}
    />
  );
};
