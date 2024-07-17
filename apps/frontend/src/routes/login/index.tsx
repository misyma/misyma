import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginUserForm } from '../../modules/auth/components/loginUserForm/loginUserForm';
import { useStoreDispatch } from '../../modules/core/store/hooks/useStoreDispatch';
import { LoginUserResponseBody } from '@common/contracts';
import { userStateActions } from '../../modules/core/store/states/userState/userStateSlice';
import { FC } from 'react';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { CookieService } from '../../modules/core/services/cookieService/cookieService';
import { DefaultFormLayout } from '../../modules/core/layouts/default/defaultFormLayout';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';

export const LoginPage: FC = () => {
  const storeDispatch = useStoreDispatch();

  const navigate = useNavigate();

  const userData = useFindUserQuery();

  const onSuccessfulLogin = async (loginUserResponseBody: LoginUserResponseBody) => {
    const { refreshToken, accessToken, expiresIn } = loginUserResponseBody;

    storeDispatch(
      userStateActions.setCurrentUserTokens({
        accessToken,
        refreshToken,
      }),
    );

    const { data } = await userData.refetch();

    if (data) {
      storeDispatch(
        userStateActions.setCurrentUser({
          user: data,
        }),
      );
    } else {
      throw new Error('Something wrong with setting user state.');
    }

    CookieService.setUserTokensCookie({
      accessToken,
      refreshToken,
      expiresIn,
    });

    navigate({
      to: '/shelves',
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
