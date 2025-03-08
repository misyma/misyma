import { type FC } from 'react';
import { useSelector } from 'react-redux';

import { FindUserBookByIdQueryOptions } from '../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { CurrentRatingStar } from '../../../book/components/currentRatingStar/currentRatingStar';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { BookTitle } from '../bookTitle/bookTitle';

interface QuotationTabTitleBarProps {
  bookId: string;
}
export const QuotationTabTitleBar: FC<QuotationTabTitleBarProps> = ({ bookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data: userBookData, isLoading } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  return (
    <div className="flex justify-between gap-4 w-full">
      {!isLoading && <BookTitle title={userBookData?.book.title ?? ''} />}
      {isLoading && <Skeleton className="h-9 w-40" />}
      {!isLoading && <CurrentRatingStar userBookId={bookId} />}
      {isLoading && <Skeleton className="h-7 w-7" />}
    </div>
  );
};
