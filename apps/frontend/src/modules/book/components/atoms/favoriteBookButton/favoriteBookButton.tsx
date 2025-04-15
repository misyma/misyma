import { type FC, useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';

import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../../common/lib/utils';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useUpdateUserBook } from '../../../hooks/updateUserBook/updateUserBook';

interface Props {
  bookId: string;
  className?: string;
  containerClassName?: string
}

export const FavoriteBookButton: FC<Props> = ({ bookId, className, containerClassName }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: userBookData } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const [isFavorite, setIsFavorite] = useState(userBookData?.isFavorite);

  const { setFavorite } = useUpdateUserBook(bookId);

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBookData) {
      setIsAnimating(true);

      try {
        setFavorite(!isFavorite);
        setIsFavorite(!isFavorite);
      } finally {
        setTimeout(() => setIsAnimating(false), 300);
      }
    }
  };

  useEffect(() => {
    setIsFavorite(userBookData?.isFavorite);
  }, [userBookData]);

  return (
    <div className={cn("h-8 w-8", containerClassName)}>
      <div className="relative">
        <HiOutlineHeart
          className={cn('h-8 w-8 cursor-pointer text-primary absolute', className, { 'animate-pulse': isAnimating })}
          onClick={onIsFavoriteChange}
        />
        <HiHeart
          className={cn('h-8 w-8 cursor-pointer text-primary absolute transition-opacity duration-300', className, {
            'opacity-100': isFavorite && !isAnimating,
            'opacity-0': !isFavorite || isAnimating,
          })}
          onClick={onIsFavoriteChange}
        />
      </div>
    </div>
  );
};
