import { Navigate, createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';
import { CreateBookForm } from '../../../modules/bookshelf/components/createBookForm/createBookForm';
import { rootRoute } from '../../root';
import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { BookCreationProvider } from '../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';

const createBookSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const CreateBook: FC = () => {
  const { id } = createBookRoute.useParams();

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center align-middle">
        <CreateBookForm bookshelfId={id}></CreateBookForm>
      </div>
    </AuthenticatedLayout>
  );
};

export const createBookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manually-create-book/$id',
  component: () => {
    return (
      <RequireAuthComponent>
        <BookCreationProvider>
          <CreateBook />
        </BookCreationProvider>
      </RequireAuthComponent>
    );
  },
  parseParams: createBookSearchSchema.parse,
  validateSearch: createBookSearchSchema,
  onError: () => {
    return <Navigate to={'/shelves'} />;
  },
});
