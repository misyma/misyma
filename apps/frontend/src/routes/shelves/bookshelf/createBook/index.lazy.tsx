import {
  createLazyFileRoute,
} from '@tanstack/react-router';
import { FC } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { CreateBookForm } from '../../../../modules/book/components/createBookForm/createBookForm';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { BookCreationProvider } from '../../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';

export const CreateBook: FC = () => {
  const { id } = Route.useSearch();

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center align-middle">
        <CreateBookForm bookshelfId={id}></CreateBookForm>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/shelves/bookshelf/createBook/')({
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
