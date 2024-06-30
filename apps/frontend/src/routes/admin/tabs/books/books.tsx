import { Link, createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { rootRoute } from '../../../root';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';

export const BooksAdminPage: FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-4 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="flex justify-between gap-4 col-span-5">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <Link
                className="cursor-pointer"
                to="/admin/authors"
              >
                Autorzy
              </Link>
              <Link className="cursor-default text-primary font-bold">Książki</Link>
            </ul>
          </div>
          <div className="flex flex-col px-4 col-span-2 sm:col-span-5"></div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const booksAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/books',
  component: () => {
    return (
      <RequireAuthComponent>
        <BooksAdminPage />
      </RequireAuthComponent>
    );
  },
});
