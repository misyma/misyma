import { type FC } from 'react';

import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { CurrentRatingStar } from '../../../../book/components/molecules/currentRatingStar/currentRatingStar';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { BookTitle } from '../../atoms/bookTitle/bookTitle';

interface QuotationTabTitleBarProps {
  bookId: string;
}
export const QuotationTabTitleBar: FC<QuotationTabTitleBarProps> = ({ bookId }) => {
  const { data: userBookData, isLoading } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  return (
    <div className="flex justify-between gap-4 w-full">
      {!isLoading && (
        <>
          <BookTitle title={userBookData?.book.title ?? ''} />
          <CurrentRatingStar userBookId={bookId} />
        </>
      )}
      {isLoading && (
        <>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-7 w-7" />
        </>
      )}
    </div>
  );
};
