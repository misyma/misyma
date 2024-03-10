/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { LoginUserForm } from './components/loginUserForm/loginUserForm';
import { useStoreDispatch } from '../../core/store/hooks/useStoreDispatch';
import { LoginUserResponseBody } from '@common/contracts';
import { userStateActions } from '../../core/store/states/userState/userStateSlice';
import { FC } from 'react';
import { DefaultFormLayout } from '../../layouts/default/defaultFormLayout';

export const LoginPage: FC = () => {
  const storeDispatch = useStoreDispatch();

  const navigate = useNavigate();

  const onSuccessfulLogin = (loginUserResponseBody: LoginUserResponseBody) => {
    const { refreshToken, accessToken } = loginUserResponseBody;

    storeDispatch(
      userStateActions.setCurrentUserTokens({
        accessToken,
        refreshToken,
      }),
    );

    navigate({
      to: '/me',
    });
  };

  return (
    <DefaultFormLayout>
      <LoginUserForm onSuccess={onSuccessfulLogin} />
    </DefaultFormLayout>
  );
};

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});
