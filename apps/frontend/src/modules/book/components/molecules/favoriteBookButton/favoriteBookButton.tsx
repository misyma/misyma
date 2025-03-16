import { useQueryClient } from '@tanstack/react-query';
import { type FC, useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';

import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../../common/lib/utils';
import { useUpdateUserBookMutation } from '../../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { BookApiQueryKeys } from '../../../api/user/queries/bookApiQueryKeys';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';

interface Props {
  bookId: string;
  className?: string;
}

export const FavoriteBookButton: FC<Props> = ({ bookId, className }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: userBookData } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const queryClient = useQueryClient();

  const [isFavorite, setIsFavorite] = useState(userBookData?.isFavorite);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBookData) {
      setIsAnimating(true);

      try {
        await updateUserBook({
          userBookId: userBookData?.id,
          isFavorite: !isFavorite,
        });

        setIsFavorite(!isFavorite);

        await Promise.all([
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
              query.queryKey[1] === userBookData?.bookshelfId,
          }),
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findUserBookById && query.queryKey[1] === userBookData?.id,
          }),
        ]);
      } finally {
        setTimeout(() => setIsAnimating(false), 300); // Match this with your CSS animation duration
      }
    }
  };

  useEffect(() => {
    setIsFavorite(userBookData?.isFavorite);
  }, [userBookData]);

  return (
    <div className="h-8 w-8">
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
