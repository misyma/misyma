import { type FC, memo, useMemo } from 'react';

import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { BookImageMiniature } from '../bookImageMiniature/bookImageMiniature';

interface BookImageLoaderProps {
  bookId: string;
}

const BookImageLoaderComponent: FC<BookImageLoaderProps> = ({ bookId }) => {
  const {
    data: userBookData,
    isLoading: isBookLoading,
    isError,
  } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const imageUrl = useMemo(() => {
    return userBookData?.imageUrl || userBookData?.book.imageUrl || '';
  }, [userBookData?.imageUrl, userBookData?.book.imageUrl]);

  if (isBookLoading) {
    return <div className="w-80 bg-gray-200 animate-pulse rounded-md" />;
  }

  if (isError) {
    return (
      <div className="w-80 bg-gray-100 flex items-center justify-center rounded-md">
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  return (
    <BookImageMiniature
      className="object-cover w-80"
      bookImageSrc={imageUrl}
    />
  );
};

export const BookImageLoader = memo(BookImageLoaderComponent);
