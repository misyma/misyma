import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';

import { type LoginUserResponseBody } from '@common/contracts';

import { LoginUserForm } from '../../modules/auth/components/loginUserForm/loginUserForm';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { DefaultFormLayout } from '../../modules/core/layouts/default/defaultFormLayout';
import { CookieService } from '../../modules/core/services/cookieService/cookieService';
import { useStoreDispatch } from '../../modules/core/store/hooks/useStoreDispatch';
import { userStateActions } from '../../modules/core/store/states/userState/userStateSlice';

export const LoginPage: FC = () => {
  const storeDispatch = useStoreDispatch();

  const navigate = useNavigate();

  const onSuccessfulLogin = async (loginUserResponseBody: LoginUserResponseBody) => {
    const { refreshToken, accessToken, expiresIn } = loginUserResponseBody;

    storeDispatch(
      userStateActions.setCurrentUserTokens({
        accessToken,
        refreshToken,
      }),
    );

    CookieService.setUserTokensCookie({
      accessToken,
      refreshToken,
      expiresIn,
    });

    navigate({
      to: '/mybooks',
    });
  };

  return (
    <DefaultFormLayout>
      <LoginUserForm onSuccess={onSuccessfulLogin} />
    </DefaultFormLayout>
  );
};

export const Route = createFileRoute('/login/')({
  component: () => {
    return (
      <RequireNonAuthComponent>
        <LoginPage />
      </RequireNonAuthComponent>
    );
  },
});
