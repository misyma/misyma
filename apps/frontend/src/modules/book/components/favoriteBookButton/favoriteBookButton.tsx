import { UserBook } from '@common/contracts';
import { FC, useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils.js';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useUpdateUserBookMutation } from '../../api/mutations/updateUserBookMutation/updateUserBookMutation.js';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  userBook: UserBook;
  className?: string;
}

export const FavoriteBookButton: FC<Props> = ({ userBook, className }) => {
  const queryClient = useQueryClient();

  const [isFavorite, setIsFavorite] = useState(userBook?.isFavorite);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBook) {
      await updateUserBook({
        userBookId: userBook.id,
        isFavorite: !isFavorite,
        accessToken: accessToken as string,
      });

      setIsFavorite(!isFavorite);

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'findBooksByBookshelfId' && query.queryKey[1] === userBook.bookshelfId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === 'findUserBookById' && query.queryKey[1] === userBook.id,
        }),
      ]);
    }
  };

  useEffect(() => {
    setIsFavorite(userBook.isFavorite)
  }, [userBook])

  return (
    <>
      {!isFavorite ? (
        <HiOutlineHeart
          className={cn('h-8 w-8 cursor-pointer', 'text-primary', className)}
          onClick={onIsFavoriteChange}
        />
      ) : (
        <HiHeart
          className={cn('h-8 w-8 cursor-pointer', 'text-primary', className)}
          onClick={onIsFavoriteChange}
        />
      )}
    </>
  );
};
