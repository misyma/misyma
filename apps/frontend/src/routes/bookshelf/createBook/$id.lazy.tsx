import { Navigate, createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';
import { CreateBookForm } from '../../../modules/book/components/createBookForm/createBookForm';
import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { BookCreationProvider } from '../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';

const createBookSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const CreateBook: FC = () => {
  const { id } = Route.useParams();

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center align-middle">
        <CreateBookForm bookshelfId={id}></CreateBookForm>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/bookshelf/createBook/$id')({
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
  onError: () => {
    return <Navigate to={'/shelves'} />;
  },
})

