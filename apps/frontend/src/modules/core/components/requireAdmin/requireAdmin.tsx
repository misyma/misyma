import React from 'react';
import { useStoreSelector } from '../../store/hooks/useStoreSelector.js';
import { Navigate } from '@tanstack/react-router';
import { userStateSelectors } from '../../store/states/userState/userStateSlice.js';
import { UserRole } from '@common/contracts';

interface RequireAuthComponentProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAuthComponentProps): React.ReactNode {
  const accessToken = useStoreSelector(userStateSelectors.selectAccessToken);

  const refreshToken = useStoreSelector(userStateSelectors.selectRefreshToken);

  const user = useStoreSelector(userStateSelectors.selectUserState);

  if (accessToken && refreshToken && user.currentUser?.role === UserRole.admin) {
    return <>{children}</>;
  }

  if (accessToken && refreshToken) {
    return <Navigate to="/shelves" />;
  }

  return <Navigate to="/login" />;
}
