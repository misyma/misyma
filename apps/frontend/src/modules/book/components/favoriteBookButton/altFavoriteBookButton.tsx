import { FC, MouseEvent, useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils.js';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation.js';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys.js';
import { UserBook } from '@common/contracts';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery.js';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions.js';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery.js';

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

  const { data } = useFindUserQuery();

  const { data: userBookData } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: book.id,
      userId: data?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  const onIsFavoriteChange = async (
    e: MouseEvent<HTMLOrSVGElement>
  ): Promise<void> => {
    e.stopPropagation();
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
    if (userBookData?.isFavorite === book.isFavorite) {
      setIsFavorite(book.isFavorite);
    }
    if (!userBookData?.isFavorite) {
      setIsFavorite(book.isFavorite);
    }
    if (userBookData && userBookData?.isFavorite !== book.isFavorite) {
      setIsFavorite(userBookData.isFavorite);
    }
  }, [book, userBookData]);

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
