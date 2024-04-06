/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { useFindBooksByBookshelfIdQuery } from '../../api/books/queries/findBooksByBookshelfId/findBooksByBookshelfIdQuery';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { Button } from '../../components/ui/button';
import { CreateBookForm } from './components/createBookForm/createBookForm';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { BookCreationProvider } from './components/createBookForm/context/bookCreationContext/bookCreationContext';

const bookshelfSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Bookshelf: FC = () => {
  const { id } = bookshelfRoute.useParams();

  const { data: user } = useFindUserQuery();

  const { data } = useFindBooksByBookshelfIdQuery({
    bookshelfId: id,
    userId: user?.id as string,
  });

  return (
    <BookCreationProvider>
      <AuthenticatedLayout>
        <div className="p-8 flex justify-center">
          <Button>Dodaj książkę</Button>
          <div>{data?.data.map((b) => b.book.title).join(',')}</div>;<CreateBookForm></CreateBookForm>
        </div>
      </AuthenticatedLayout>
    </BookCreationProvider>
  );
};

export const bookshelfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookshelf/$id',
  component: () => {
    return (
      <RequireAuthComponent>
        <Bookshelf />
      </RequireAuthComponent>
    );
  },
  parseParams: bookshelfSearchSchema.parse,
  validateSearch: bookshelfSearchSchema,
  onError: () => {
    return <Navigate to={'/shelves'} />;
  },
});
