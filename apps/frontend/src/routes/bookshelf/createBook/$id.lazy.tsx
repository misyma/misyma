import {
  createLazyFileRoute,
} from '@tanstack/react-router';
import { FC } from 'react';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';
import { CreateBookForm } from '../../../modules/book/components/createBookForm/createBookForm';
import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { BookCreationProvider } from '../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';

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

export const Route = createLazyFileRoute('/bookshelf/createBook/$id')({
  component: () => {
    return (
      <RequireAuthComponent>
        <BookCreationProvider>
          <CreateBook />
        </BookCreationProvider>
      </RequireAuthComponent>
    );
  },
});
