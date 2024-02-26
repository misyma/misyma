import React from 'react';
import { useStoreSelector } from '../../store/hooks/useStoreSelector.js';
import { Navigate } from '@tanstack/react-router';
import { userStateSelectors } from '../../store/states/userState/userStateSlice.js';

interface RequireAuthComponentProps {
  children: React.ReactNode;
}

export function RequireAuthComponent({ children }: RequireAuthComponentProps): React.ReactNode {
  const currentUserTokens = useStoreSelector(userStateSelectors.selectCurrentUserTokens);

  return currentUserTokens.accessToken && currentUserTokens.refreshToken ? <>{children}</> : <Navigate to="/login" />;
}
