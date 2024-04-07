/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { RequireAuthComponent } from '../../../core/components/requireAuth/requireAuthComponent';
import { CreateBookForm } from '../components/createBookForm/createBookForm';
import { rootRoute } from '../../root';
import { BookCreationProvider } from '../components/createBookForm/context/bookCreationContext/bookCreationContext';
import { AuthenticatedLayout } from '../../../layouts/authenticated/authenticatedLayout';
import { z } from 'zod';

const createBookSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const CreateBook: FC = () => {
  const { id } = createBookRoute.useParams();

  return (
    <BookCreationProvider>
      <AuthenticatedLayout>
        <div className="flex items-center justify-center align-middle">
          <CreateBookForm bookshelfId={id}></CreateBookForm>
        </div>
      </AuthenticatedLayout>
    </BookCreationProvider>
  );
};

export const createBookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-book/$id',
  component: () => {
    return (
      <RequireAuthComponent>
        <CreateBook />
      </RequireAuthComponent>
    );
  },
  parseParams: createBookSearchSchema.parse,
  validateSearch: createBookSearchSchema,
  onError: () => {
    return <Navigate to={'/shelves'} />;
  },
});
