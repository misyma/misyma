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

  const navigate = useNavigate();

  return (
      <AuthenticatedLayout>
        <div className="p-8 flex justify-center">
          <Button
            onClick={() => {
              navigate({
                to: `/create-book/${id}`,
              });
            }}
          >
            Dodaj książkę
          </Button>
          <div>{data?.data.map((b) => b.book.title).join(',')}</div>
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
