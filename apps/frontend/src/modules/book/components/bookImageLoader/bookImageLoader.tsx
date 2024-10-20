import { FC } from 'react';
import { BookImageMiniature } from '../bookImageMiniature/bookImageMiniature';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useQuery } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';

interface BookImageLoaderProps {
  bookId: string;
}
export const BookImageLoader: FC<BookImageLoaderProps> = ({ bookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();
  const { data: userBookData } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  return (
    <BookImageMiniature
      className="object-cover max-w-80"
      bookImageSrc={
        (userBookData?.imageUrl || userBookData?.book.imageUrl) ?? ''
      }
    />
  );
};
