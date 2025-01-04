import { type FC } from 'react';
import { IoMdStar } from 'react-icons/io';
import { useSelector } from 'react-redux';

import { SortOrder } from '@common/contracts';

import { FindBookReadingsQueryOptions } from '../../../bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';

interface Props {
  userBookId: string;
}

export const CurrentRatingStar: FC<Props> = ({ userBookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookReadings, isLoading } = useErrorHandledQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId,
      pageSize: 1,
      sortDate: SortOrder.desc,
    }),
  );

  if (isLoading) {
    return <Skeleton className="h-7 w-7" />;
  }

  return bookReadings?.data?.[0] ? (
    <div className="flex flex-shrink-0 items-center">
      <div>
        <p className="text-2xl">{bookReadings.data[0].rating}</p>
      </div>
      <div>
        <IoMdStar className="h-7 w-7 text-base text-primary" />
      </div>
    </div>
  ) : (
    <></>
  );
};
