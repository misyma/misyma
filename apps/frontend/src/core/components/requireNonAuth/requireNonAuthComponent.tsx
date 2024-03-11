import { Navigate } from '@tanstack/react-router';
import { useStoreSelector } from '../../store/hooks/useStoreSelector';
import { userStateSelectors } from '../../store/states/userState/userStateSlice';

interface Props {
  children: React.ReactNode;
}

export function RequireNonAuthComponent({ children }: Props): React.ReactNode {
  const currentUserTokens = useStoreSelector(userStateSelectors.selectCurrentUserTokens);

  return !currentUserTokens.accessToken && !currentUserTokens.refreshToken ? (
    <>{children}</>
  ) : (
    <Navigate to="/test1" />
  );
}
