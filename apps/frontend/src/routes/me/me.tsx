import { Outlet, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';

export const AuthenticatedPage: FC = () => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const refreshToken = useSelector(userStateSelectors.selectRefreshToken);

  const { data, isFetching, isFetched } = useFindUserQuery();

  if (!accessToken || !refreshToken) {
    return null;
  }

  return (
    <>
      {isFetching && <div>Loading...</div>}
      {isFetched && !data && <div>Something went wrong...</div>}
      {isFetched && data && (
        <AuthenticatedLayout>
          <div>
            Witaj {data.name}! Twój email to: {data.email}.
          </div>
        </AuthenticatedLayout>
      )}
      <Outlet />
    </>
  );
};

export const meRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'me',
  component: () => {
    return (
      <RequireAuthComponent>
        <AuthenticatedPage />
      </RequireAuthComponent>
    );
  },
});
