/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';

export const AuthenticatedPage: FC = () => {
  const userTokens = useSelector(userStateSelectors.selectCurrentUserTokens);

  const { data, isFetching, isFetched } = useFindUserQuery();

  if (!userTokens.accessToken || !userTokens.refreshToken) {
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
