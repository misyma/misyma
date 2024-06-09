import { Navigate, createRoute, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { FindBooksByBookshelfIdQueryOptions } from '../../modules/book/api/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../../modules/common/components/ui/button';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { Separator } from '../../modules/common/components/ui/separator';
import { HiCheckCircle, HiDotsCircleHorizontal, HiQuestionMarkCircle } from 'react-icons/hi';
import { ReadingStatus, UserBook } from '@common/contracts';
import { cn } from '../../modules/common/lib/utils';
import { FavoriteBookButton } from '../myBooks/components/favoriteBookButton/favoriteBookButton';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice';
import { useFindBookshelfByIdQuery } from '../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';

const bookshelfSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Bookshelf: FC = () => {
  const { id } = bookshelfRoute.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken)

  const { data: user } = useFindUserQuery();

  const { data: bookshelfBooksResponse } = useQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId: id,
      userId: user?.id as string,
    }),
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(id);

  const navigate = useNavigate();

  const readingStatusMap = {
    [ReadingStatus.finished]: HiCheckCircle,
    [ReadingStatus.inProgress]: HiDotsCircleHorizontal,
    [ReadingStatus.toRead]: HiQuestionMarkCircle,
  };

  const readingStatusColor = {
    [ReadingStatus.finished]: 'text-green-400',
    [ReadingStatus.inProgress]: 'text-blue-300',
    [ReadingStatus.toRead]: 'text-slate-500',
  };

  const renderStatusIcon = (book: UserBook) => {
    const Icon = readingStatusMap[book.status];

    return <Icon className={cn('h-7 w-7 cursor-default pointer-events-auto', readingStatusColor[book.status])} />;
  };

  const getCountNoun = (len: number): string => {
    switch (len) {
      case 1:
        return 'książka';

      case 2:
      case 3:
      case 4:
        return 'książki';

      default:
        return 'książek';
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="p-8 flex flex-col justify-center w-full items-center">
        <div className="flex justify-between w-full sm:max-w-7xl">
          <div>
            <p className="text-xl sm:text-3xl">{bookshelfResponse?.name ?? ' '}</p>
            <p>
              {bookshelfBooksResponse?.data.length ?? 0} {getCountNoun(bookshelfBooksResponse?.data.length ?? 0)}
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
              key={`${userBook.bookId}-${index}`}
              className="relative flex align-middle items-center gap-4 w-full cursor-pointer"
            >
              <div
                onClick={() => {
                  navigate({
                    to: '/book/$bookId',
                    params: {
                      bookId: userBook.id,
                    },
                  });
                }}
                className="cursor-pointer absolute w-full h-[100%]"
              ></div>
              <div className="z-10">
                <img
                  onClick={() => {
                    navigate({
                      to: '/book/$bookId',
                      params: {
                        bookId: userBook.id,
                      },
                    });
                  }}
                  src={userBook.imageUrl}
                  className="object-contain aspect-square max-w-[200px]"
                />
              </div>
              <div className="z-10 w-full px-12 pointer-events-none">
                <div className="flex justify-between w-full">
                  <div className="font-semibold text-lg sm:text-2xl">{userBook.book.title}</div>
                  <div className="flex gap-2 items-center justify-center">
                    <FavoriteBookButton
                      className="pointer-events-auto"
                      userBook={userBook}
                    />
                    {renderStatusIcon(userBook)}
                  </div>
                </div>
                <Separator className="my-4 bg-primary"></Separator>
                <div className="px-2">
                  {userBook.book.authors[0].name}, {userBook.book.releaseYear}, {userBook.genres[0]?.name}{' '}
                </div>
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
