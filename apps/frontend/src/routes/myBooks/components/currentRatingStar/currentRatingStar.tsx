import { FC } from 'react';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { useQuery } from '@tanstack/react-query';
import { FindBookReadingsQueryOptions } from '../../../../api/bookReadings/queries/findBookReadings/findBookReadingsQueryOptions';
import { IoMdStar } from 'react-icons/io';

interface Props {
  userBookId: string;
}

export const CurrentRatingStar: FC<Props> = ({ userBookId }) => {
  const { data: userData } = useFindUserQuery();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookReadings } = useQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId,
      userId: userData?.id as string,
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
