import { createFileRoute } from '@tanstack/react-router';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';

export const ProfilePage = () => {
  return (
    <AuthenticatedLayout>
      <div>XD</div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/profile/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <ProfilePage />
      </RequireAuthComponent>
    );
  },
})
