import { createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';

import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { CreateBookForm } from '../../../modules/book/components/createBookForm/createBookForm';
import { BookCreationProvider } from '../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';

export const CreateBook: FC = () => {
  const { id } = Route.useSearch();

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center align-middle">
        <CreateBookForm
          navigateTo="books"
          bookshelfId={id}
        ></CreateBookForm>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/mybooks/createBook/')({
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
