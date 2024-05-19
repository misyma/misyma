/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { useFindBooksByBookshelfIdQuery } from '../../api/books/queries/findBooksByBookshelfId/findBooksByBookshelfIdQuery';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { Button } from '../../components/ui/button';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { useFindBookshelfByIdQuery } from '../../api/bookshelf/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';

const bookshelfSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Bookshelf: FC = () => {
  const { id } = bookshelfRoute.useParams();

  const { data: user } = useFindUserQuery();

  const { data: bookshelfBooksResponse } = useFindBooksByBookshelfIdQuery({
    bookshelfId: id,
    userId: user?.id as string,
  });

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(id);

  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="p-8 flex flex-col justify-center">
        <div className="flex justify-around w-full">
          <div>
            <p className='text-xl sm:text-3xl'>
              {bookshelfResponse?.name ?? ' '}
            </p>
            <p>
              {bookshelfBooksResponse?.data.length ?? 0} książek
            </p>
          </div>
          <Button
            onClick={() => {
              navigate({
                to: `/search`,
                search: {
                  type: 'isbn',
                  next: 0,
                  bookshelfId: id,
                },
              });
            }}
          >
            Dodaj książkę
          </Button>
        </div>
        <div className="flex flex-col justify-center gap-8 pt-4 bg-slate-">
          {bookshelfBooksResponse?.data.map((userBook, index) => (
            <div key={`${userBook.bookId}-${index}`} className="flex flex-col justify-center align-middle items-center border-primary border gap-4">
              <p>Tytuł: {userBook.book.title}</p>
              <h1>Format: {userBook.book.format}</h1>
              <h2>Język: {userBook.book.language}</h2>
              <h2>Data wydania: {userBook.book.releaseYear}</h2>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
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
