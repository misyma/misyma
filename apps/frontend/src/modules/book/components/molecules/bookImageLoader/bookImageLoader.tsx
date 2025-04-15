import { type FC, memo, useMemo } from 'react';

import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';

interface BookImageLoaderProps {
  bookId: string;
}

const DEFAULT_BOOK_SRC = '/book.jpg';

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
    return userBookData?.imageUrl || userBookData?.book.imageUrl || DEFAULT_BOOK_SRC;
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
    <div className='w-full min-w-[320px]'>
      <img
        src={imageUrl}
        className={'object-contain w-full h-full'}
        alt="Book cover"
      />
    </div>
  );
};

export const BookImageLoader = memo(BookImageLoaderComponent);
