import { UserBook } from '@common/contracts';
import { FC, useState } from 'react';
import { useUpdateUserBookMutation } from '../../../../api/books/mutations/updateUserBookMutation/updateUserBookMutation.js';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../../lib/utils.js';

interface Props {
  userBook: UserBook;
}

export const FavoriteBookButton: FC<Props> = ({ userBook }) => {
  const [isFavorite, setIsFavorite] = useState(userBook?.isFavorite ?? false);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBook) {
      await updateUserBook({
        userBookId: userBook.id,
        isFavorite: !userBook.isFavorite,
      });

      setIsFavorite(!isFavorite);
    }
  };

  return (
    <>
      {!isFavorite ? (
        <HiOutlineHeart
          className={cn('h-8 w-8 cursor-pointer', 'text-primary')}
          onClick={onIsFavoriteChange}
        />
      ) : (
        <HiHeart
          className={cn('h-8 w-8 cursor-pointer', 'text-primary' )}
          onClick={onIsFavoriteChange}
        />
      )}
    </>
  );
};
