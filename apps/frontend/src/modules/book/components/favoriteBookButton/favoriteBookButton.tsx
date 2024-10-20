import { UserBook } from '@common/contracts';
import { FC, useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils.js';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation.js';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys.js';

interface Props {
  userBook: UserBook;
  className?: string;
}

export const FavoriteBookButton: FC<Props> = ({ userBook, className }) => {
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(userBook?.isFavorite);
  const [isAnimating, setIsAnimating] = useState(false);
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBook) {
      setIsAnimating(true);
      try {
        await updateUserBook({
          userBookId: userBook?.id,
          isFavorite: !isFavorite,
          accessToken: accessToken as string,
        });
        setIsFavorite(!isFavorite);
        await Promise.all([
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
              query.queryKey[1] === userBook?.bookshelfId,
          }),
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findUserBookById &&
              query.queryKey[1] === userBook?.id,
          }),
        ]);
      } finally {
        setTimeout(() => setIsAnimating(false), 300); // Match this with your CSS animation duration
      }
    }
  };

  useEffect(() => {
    setIsFavorite(userBook?.isFavorite);
  }, [userBook]);

  return (
    <div className='h-8 w-8'>
      <div className="relative">
        <HiOutlineHeart
          className={cn(
            'h-8 w-8 cursor-pointer text-primary absolute',
            className,
            { 'animate-pulse': isAnimating }
          )}
          onClick={onIsFavoriteChange}
        />
        <HiHeart
          className={cn(
            'h-8 w-8 cursor-pointer text-primary absolute transition-opacity duration-300',
            className,
            {
              'opacity-100': isFavorite && !isAnimating,
              'opacity-0': !isFavorite || isAnimating,
            }
          )}
          onClick={onIsFavoriteChange}
        />
      </div>
    </div>
  );
};
