import { FC } from 'react';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { useQuery } from '@tanstack/react-query';
import { IoMdStar } from 'react-icons/io';
import { FindBookReadingsQueryOptions } from '../../../../modules/bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';

interface Props {
  userBookId: string;
}

export const CurrentRatingStar: FC<Props> = ({ userBookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookReadings } = useQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId,
      pageSize: 1,
    }),
  );

  return bookReadings?.data[0] ? (
    <div className="flex items-center">
      <div>
        <p className="text-2xl">{bookReadings.data[0].rating}</p>
      </div>
      <div>
        <IoMdStar className="h-7 w-7 text-base text-primary" />
      </div>
    </div>
  ) : (
    <IoMdStar className="h-7 w-7" />
  );
};
