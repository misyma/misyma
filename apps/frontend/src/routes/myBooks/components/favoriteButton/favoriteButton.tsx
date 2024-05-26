import { UserBook } from '@common/contracts';
import { FC, useState } from 'react';
import { useUpdateUserBookMutation } from '../../../../api/books/mutations/updateUserBookMutation/updateUserBookMutation.js';
import { HiHeart } from 'react-icons/hi';
import { cn } from '../../../../lib/utils.js';

interface Props {
  userBook: UserBook;
  userId: string;
}

export const IsFavoriteButton: FC<Props> = ({ userBook, userId }) => {
  const [isFavorite, setIsFavorite] = useState(userBook?.isFavorite ?? false);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (userBook) {
      await updateUserBook({
        id: userBook.id,
        userId: userId as string,
        isFavorite: !userBook.isFavorite,
      });

      setIsFavorite(!isFavorite);
    }
  };

  return (
    <HiHeart
      className={cn('h-8 w-8 cursor-pointer', isFavorite ? 'text-primary' : 'text-black')}
      onClick={onIsFavoriteChange}
    />
  );
};
