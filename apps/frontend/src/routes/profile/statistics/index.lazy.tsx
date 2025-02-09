import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';

import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { TopBooksSection } from '../../../modules/book/components/topBooksSection/topBooksSection';
import { Button } from '../../../modules/common/components/button/button';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';

export const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center w-full px-8 gap-4">
        <div className="grid gap-4 items-center justify-items-center w-full">
          <div className="w-[64rem]">
            <TopBooksSection />
          </div>
          <Button
            onClick={() => {
              navigate({
                to: '/mybooks',
                search: {
                  sortOrder: 'desc',
                  sortField: 'rating',
                },
              });
            }}
          >
            Zobacz wszystkie
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/profile/statistics/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <ProfilePage />
      </RequireAuthComponent>
    );
  },
});
