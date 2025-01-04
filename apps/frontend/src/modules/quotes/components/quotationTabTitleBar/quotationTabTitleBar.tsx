import { type FC } from 'react';
import { useSelector } from 'react-redux';

import { FindUserBookByIdQueryOptions } from '../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { CurrentRatingStar } from '../../../book/components/currentRatingStar/currentRatingStar';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';

interface QuotationTabTitleBarProps {
  bookId: string;
}
export const QuotationTabTitleBar: FC<QuotationTabTitleBarProps> = ({ bookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data: userBookData, isFetching } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  return (
    <div className="flex justify-between w-full">
      {!isFetching && <p className="font-semibold text-3xl w-1/2 block truncate">{userBookData?.book.title}</p>}
      {isFetching && <Skeleton className="h-9 w-40" />}
      {!isFetching && <CurrentRatingStar userBookId={bookId} />}
      {isFetching && <Skeleton className="h-7 w-7" />}
    </div>
  );
};
