import { UserBook } from '@common/contracts';
import { FC, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils.js';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useUpdateUserBookMutation } from '../../api/mutations/updateUserBookMutation/updateUserBookMutation.js';

interface Props {
  userBook: UserBook;
  className?: string;
}

export const FavoriteBookButton: FC<Props> = ({ userBook, className }) => {
  const [isFavorite, setIsFavorite] = useState(userBook?.isFavorite ?? false);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBook) {
      await updateUserBook({
        userBookId: userBook.id,
        isFavorite: !userBook.isFavorite,
        accessToken: accessToken as string,
      });

      setIsFavorite(!isFavorite);
    }
  };

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
