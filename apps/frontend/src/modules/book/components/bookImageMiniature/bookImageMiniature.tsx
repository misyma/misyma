import { UserBook } from '@common/contracts';
import { FC } from 'react';
import { cn } from '../../../common/lib/utils';

interface BookImageProps {
  userBook?: UserBook;
  onClick?: () => void;
  className?: string;
}

export const BookImageMiniature: FC<BookImageProps> = ({
  userBook,
  onClick,
  className,
}) => (
  <img
    onClick={onClick}
    src={userBook?.imageUrl || userBook?.book.imageUrl || '/book.jpg'}
    className={cn('object-contain aspect-square max-w-[200px]', className)}
  />
);
