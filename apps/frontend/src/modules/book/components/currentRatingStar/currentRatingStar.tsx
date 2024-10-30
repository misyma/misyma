import { FC } from 'react';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useQuery } from '@tanstack/react-query';
import { IoMdStar } from 'react-icons/io';
import { FindBookReadingsQueryOptions } from '../../../bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';
import { SortingType } from '@common/contracts';
import { Skeleton } from '../../../common/components/skeleton/skeleton';

interface Props {
  userBookId: string;
}

export const CurrentRatingStar: FC<Props> = ({ userBookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookReadings, isLoading } = useQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId,
      pageSize: 1,
      sortDate: SortingType.desc,
    }),
  );

  if (isLoading) {
    return <Skeleton className='h-7 w-7'/>
  }

  return bookReadings?.data[0] ? (
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
