import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';

export const AuthenticatedPage: FC = () => {
  const userTokens = useSelector(userStateSelectors.selectCurrentUserTokens)

  const { data, isFetching, isFetched } = useFindUserQuery();

  if(!userTokens.accessToken || !userTokens.refreshToken) {
    return null;
  }

  return (
    <>
    {isFetching && <div>Loading...</div>}
    {isFetched && !data && <div>Something went wrong...</div>}
    {isFetched && data && (
      <div>
        Witaj {data.name}! Twój email to: {data.email}.
      </div>
    )}
      <Outlet />
    </>
  );
};
