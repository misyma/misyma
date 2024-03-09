/* eslint-disable react-refresh/only-export-components */
import { FC } from 'react';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';

export const ShelvesPage: FC = () => {
  return (
    <AuthenticatedLayout>
      <h1>Shelves</h1>
    </AuthenticatedLayout>
  );
};

export const shelvesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shelves',
  component: () => {
    return (
      <RequireAuthComponent>
        <ShelvesPage />
      </RequireAuthComponent>
    );
  },
});
