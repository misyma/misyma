import React from 'react';
import { useStoreSelector } from '../../store/hooks/useStoreSelector.js';
import { Navigate } from '@tanstack/react-router';
import { userStateActions, userStateSelectors } from '../../store/states/userState/userStateSlice.js';
import { UserRole } from '@common/contracts';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery.js';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner.js';
import { useStoreDispatch } from '../../store/hooks/useStoreDispatch.js';

interface RequireAuthComponentProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAuthComponentProps): React.ReactNode {
  const accessToken = useStoreSelector(userStateSelectors.selectAccessToken);

  const refreshToken = useStoreSelector(userStateSelectors.selectRefreshToken);

  const dispatch = useStoreDispatch();

  const user = useStoreSelector(userStateSelectors.selectUserState);

  const res = useFindUserQuery();

  if (res.isFetched && res.data) {
    dispatch(
      userStateActions.setCurrentUser({
        user: res.data,
      }),
    );
  }

  if (accessToken && refreshToken && user.currentUser !== null && user.currentUser?.role === UserRole.admin) {
    return <>{children}</>;
  }

  if (user.currentUser === null && res.isFetching) {
    return (
      <div className="w-full h-[100%] flex justify-center items-center">
        <LoadingSpinner></LoadingSpinner>
      </div>
    );
  }

  if (accessToken && refreshToken) {
    return <Navigate to="/shelves" />;
  }

  return <Navigate to="/login" />;
}
