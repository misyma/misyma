import { type FC } from 'react';
import { FaBookmark } from 'react-icons/fa6';

import { type UserBook } from '@common/contracts';

import { cn } from '../../../../common/lib/utils.js';

interface Props {
  book: UserBook;
}

export const BookmarkButton: FC<Props> = ({ book }) => {
  return (
    <div className="h-9 w-9 relative">
      <FaBookmark className={cn('h-9 w-9 text-primary')} />
      <div className="absolute inset-0 flex items-center justify-center font-bold text-white">{book.latestRating}</div>
    </div>
  );
};
