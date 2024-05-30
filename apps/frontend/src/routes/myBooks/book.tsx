/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { rootRoute } from '../root';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { IoMdStar } from 'react-icons/io';
import { useFindUserBookQuery } from '../../api/books/queries/findUserBook/findUserBookQuery';
import { UserBook } from '@common/contracts';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';

import { IsFavoriteButton } from './components/favoriteButton/favoriteButton';
import { BookshelfChoiceDropdown } from './components/bookshelfChoiceDropdown/bookshelfChoiceDropdown';
import { StatusChooserCards } from './components/statusChooser/statusChooserCards';
import { Skeleton } from '../../components/ui/skeleton';
import { StarRating } from './components/starRating/starRating';

export const BookPage: FC = () => {
  const { bookId } = bookRoute.useParams();

  const { data: userData } = useFindUserQuery();

  const { data, isFetched, isFetching, isRefetching } = useFindUserBookQuery({
    userBookId: bookId,
    userId: userData?.id ?? '',
  });

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="col-span-2 sm:col-start-1 sm:col-span-5 flex justify-between">
            {/* sm:visible otherwise dropdown component visible */}
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <li className="cursor-pointer">Dane podstawowe</li>
              <li className="cursor-pointer">Cytaty</li>
              <li className="cursor-pointer">Oceny</li>
            </ul>
            <Button className="w-32 sm:w-96">Edytuj dane</Button>
          </div>
          <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
            {isFetching && !isRefetching && (
              <>
                <div>
                  <Skeleton className="w-60 h-80"></Skeleton>
                </div>
                <div>
                  <Skeleton className="h-8 w-8"></Skeleton>
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full">
                    <Skeleton className="w-80 h-9"></Skeleton>
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Separator></Separator>
                  <div className="flex w-full justify-between">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                      <Skeleton className="w-48 h-6"></Skeleton>
                    </div>
                    <div className="flex gap-12 flex-col items-end justify-start">
                      <BookshelfChoiceDropdown bookId={bookId} />
                      <div className="flex flex-col text-lg items-end gap-2">
                        <Skeleton className="w-40 h-8"></Skeleton>
                        <StatusChooserCards bookId={bookId}></StatusChooserCards>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p>Dodaj ocenę</p>
                        <StarRating bookId={data?.bookId ?? ''}></StarRating>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
              <>
                <div>
                  <img
                    src={data?.imageUrl}
                    className="object-cover max-w-80"
                  />
                </div>
                <div className="flex justify-center">
                  <IsFavoriteButton
                    userBook={data as UserBook}
                    userId={userData?.id as string}
                  />
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full">
                    <p className="font-semibold text-3xl">{data?.book.title}</p>
                    <IoMdStar className="h-8 w-8" />
                  </div>
                  <Separator></Separator>
                  <div className="flex w-full justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-lg pb-6">{data?.book.authors[0]?.name}</p>
                      <p>ISBN: {data?.book.isbn}</p>
                      <p>Rok wydania: {data?.book.releaseYear}</p>
                      <p>Język: {data?.book.language}</p>
                      <p>Tłumacz: {data?.book.translator}</p>
                      <p>Format: {data?.book.format}</p>
                      <p>Liczba stron: {data?.book.pages}</p>
                      <p>Kategoria: {data?.genres[0]?.name}</p>
                    </div>
                    <div className="flex gap-12 flex-col items-end justify-start">
                      <BookshelfChoiceDropdown bookId={data?.id ?? ''} />
                      <div className="flex flex-col text-lg items-end gap-2">
                        <p>Status</p>
                        <StatusChooserCards bookId={data?.id ?? ''}></StatusChooserCards>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p>Dodaj ocenę</p>
                        <StarRating bookId={data?.id ?? ''}></StarRating>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$bookId',
  component: BookPage,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
});
