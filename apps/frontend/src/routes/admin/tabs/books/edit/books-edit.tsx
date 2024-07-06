import { createRoute, Navigate } from '@tanstack/react-router';
import { rootRoute } from '../../../../root';
import { z } from 'zod';
import { RequireAuthComponent } from '../../../../../modules/core/components/requireAuth/requireAuthComponent';
import { FC } from 'react';
import { AuthenticatedLayout } from '../../../../../modules/auth/layouts/authenticated/authenticatedLayout';

const booksSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

const BooksEdit: FC = () => {
  const { id } = booksEditAdminRoute.useParams();

  return (
    <AuthenticatedLayout>
      <div>{id}</div>
    </AuthenticatedLayout>
  );
};

export const booksEditAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `admin/books/$id/edit`,
  component: () => {
    return (
      <RequireAuthComponent>
        <BooksEdit />
      </RequireAuthComponent>
    );
  },
  parseParams: booksSearchSchema.parse,
  validateSearch: booksSearchSchema,
  onError: () => {
    return <Navigate to={'/admin/books'} />;
  },
});
