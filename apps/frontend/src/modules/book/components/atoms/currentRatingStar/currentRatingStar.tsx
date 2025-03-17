import { type FC } from 'react';
import { IoMdStar } from 'react-icons/io';

import { SortOrder } from '@common/contracts';

import { FindBookReadingsQueryOptions } from '../../../../bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';

interface Props {
  userBookId: string;
}

export const CurrentRatingStar: FC<Props> = ({ userBookId }) => {
  const { data: bookReadings, isLoading } = useErrorHandledQuery(
    FindBookReadingsQueryOptions({
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
