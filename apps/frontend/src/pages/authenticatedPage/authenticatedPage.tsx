import { FC, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useStoreSelector } from '../../core/store/hooks/useStoreSelector';

export const AuthenticatedPage: FC = () => {
  const currentUser = useStoreSelector((state) => state.user.currentUser);

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Outlet />
    </>
  );
};
