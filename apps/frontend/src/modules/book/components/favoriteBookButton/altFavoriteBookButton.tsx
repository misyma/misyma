import { FC, useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils.js';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation.js';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys.js';
import { UserBook } from '@common/contracts';

interface Props {
  book: UserBook;
  className?: string;
}

export const AltFavoriteBookButton: FC<Props> = ({ book, className }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const [isFavorite, setIsFavorite] = useState(book?.isFavorite);
  const { mutateAsync: updateUserBook, isPending } = useUpdateUserBookMutation(
    {}
  );

  const onIsFavoriteChange = async (): Promise<void> => {
    if (isPending) {
      return;
    }
    if (book) {
      setIsAnimating(true);
      try {
        await updateUserBook({
          userBookId: book?.id,
          isFavorite: !isFavorite,
          accessToken: accessToken as string,
        });
        setIsFavorite(!isFavorite);
        await Promise.all([
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
              query.queryKey[1] === book?.bookshelfId,
          }),
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findUserBookById &&
              query.queryKey[1] === book?.id,
          }),
        ]);
      } finally {
        setTimeout(() => setIsAnimating(false), 300); // Match this with your CSS animation duration
      }
    }
  };

  useEffect(() => {
    setIsFavorite(book?.isFavorite);
  }, [book]);

  return (
    <div className="h-8 w-8">
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
            },
            isPending ? 'cursor-default' : ''
          )}
          onClick={onIsFavoriteChange}
        />
      </div>
    </div>
  );
};
