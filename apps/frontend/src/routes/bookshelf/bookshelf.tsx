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
import { Separator } from '../../components/ui/separator';
import { IoMdStar } from "react-icons/io";

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
      <div className="p-8 flex flex-col justify-center w-full items-center">
        <div className="flex justify-between w-full sm:max-w-7xl">
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
        <div className="flex flex-col justify-center gap-8 pt-8 w-full sm:max-w-7xl">
          {bookshelfBooksResponse?.data.map((userBook, index) => (
            <div 
            onClick={() => {
              navigate({
                to: '/book/$bookId',
                params: {
                  bookId: userBook.id
                }
              })
            }}
            key={`${userBook.bookId}-${index}`} className="flex align-middle items-center gap-4 w-full cursor-pointer">
              <div>
                <img src={userBook.imageUrl} className='object-contain aspect-square max-w-[200px]' />
              </div>    
              <div className='w-full px-12'>
                <div className='flex justify-between w-full'>
                  <div className='font-semibold text-lg sm:text-2xl'>{userBook.book.title}</div>
                  <div>
                    {}
                    <IoMdStar className='h-8 w-8' />
                  </div>
                </div>
                <Separator className='my-4 bg-primary'></Separator>
                <div className='px-2'>{userBook.book.authors[0].name}, {userBook.book.releaseYear}, {userBook.genres[0]?.name} </div>
              </div>
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
