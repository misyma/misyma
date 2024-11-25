import { UserBook } from '@common/contracts';
import { FC, useEffect, useState } from 'react';
import { cn } from '../../../common/lib/utils';
import { Skeleton } from '../../../common/components/skeleton/skeleton';

const DEFAULT_BOOK_SRC = '/book.jpg';

interface BookImageProps {
  userBook?: UserBook;
  onClick?: () => void;
  className?: string;
  bookImageSrc?: string;
  imageClassName?: string;
}

export const BookImageMiniature: FC<BookImageProps> = ({
  userBook,
  onClick,
  className,
  bookImageSrc,
  imageClassName,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const src =
      userBook?.imageUrl ||
      userBook?.book.imageUrl ||
      bookImageSrc ||
      DEFAULT_BOOK_SRC;
    setImageSrc(src);
  }, [userBook, bookImageSrc]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn('relative aspect-square w-40', className)}>
      {isLoading && <Skeleton className="w-full h-full" />}
      <img
        onClick={onClick}
        src={imageSrc}
        onLoad={handleImageLoad}
        className={cn(
          'object-contain w-full h-full',
          isLoading ? 'invisible' : 'visible',
          imageClassName
        )}
        alt="Book cover"
      />
    </div>
  );
};
