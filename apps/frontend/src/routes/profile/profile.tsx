import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';

export const ProfilePage = () => {
  return (
    <AuthenticatedLayout>
      <div>XD</div>
    </AuthenticatedLayout>
  );
};

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => {
    return (
      <RequireAuthComponent>
        <ProfilePage />
      </RequireAuthComponent>
    );
  },
});
