import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { FC } from 'react';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';

export const AdminPage: FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="flex flex-col gap-4">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <Link
                to="/admin/authors"
                className="cursor-pointer"
              >
                Autorzy
              </Link>
              <Link
                to="/admin/books"
                className="cursor-pointer"
              >
                Książki
              </Link>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: () => {
    return (
      <RequireAuthComponent>
        <AdminPage />
      </RequireAuthComponent>
    );
  },
});
