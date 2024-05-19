/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { rootRoute } from '../root';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useStoreSelector } from '../../core/store/hooks/useStoreSelector';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { IoMdStar } from 'react-icons/io';
import { useFindUserBookQuery } from '../../api/books/queries/findUserBook/findUserBookQuery';
import { ReadingStatus } from '@common/contracts';
import { cn } from '../../lib/utils';
import { GoCheckCircleFill } from 'react-icons/go';
import { HiDotsHorizontal } from "react-icons/hi";
import { FaQuestion } from "react-icons/fa";

export const BookPage: FC = () => {
  const { bookId } = bookRoute.useParams();

  const userId = useStoreSelector(userStateSelectors.selectCurrentUserId);

  const { data } = useFindUserBookQuery({
    id: bookId,
    userId: userId ?? '',
  });

  const statusMap = {
    [ReadingStatus.toRead]: 'Do przeczytania',
    [ReadingStatus.inProgress]: 'W trakcie',
    [ReadingStatus.finished]: 'Przeczytana',
  };

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-7xl">
          <div className="col-span-2 sm:col-start-2 sm:col-span-4 flex justify-between">
            <div className="font-semibold text-xl sm:text-3xl">Nazwa półki</div>
            <Button className="w-32 sm:w-96">Edytuj dane</Button>
          </div>
          <div className='col-start-1 col-span-2 sm:col-span-1'>
            <ul className="flex justify-between sm:flex-col gap-4 text-sm sm:text-lg font-semibold">
              <li className='cursor-pointer'>Dane podstawowe</li>
              <li className='cursor-pointer'>Historia i notatki</li>
              <li className='cursor-pointer'>Cytaty</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-4 gap-16 w-full">
            <div>
              <img
                src={data?.imageUrl}
                className="object-cover max-w-80"
              />
            </div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between w-full">
                <p className="font-semibold text-3xl">Tytuł książki</p>
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
                <div>
                  <div
                    autoCapitalize="true"
                    className={cn(
                      'rounded-full sm:w-60 px-2 py-2 uppercase text-center text-white font-bold',
                      `bg-status-${data?.status}`,
                    )}
                  >
                    <p className="hidden sm:inline-block">{statusMap[data?.status as ReadingStatus]}</p>
                    {data?.status === ReadingStatus.finished && <GoCheckCircleFill className="sm:hidden" />}
                    {data?.status === ReadingStatus.inProgress && <HiDotsHorizontal className="sm:hidden" />}
                    {data?.status === ReadingStatus.toRead && <FaQuestion className="sm:hidden" />}
                  </div>
                </div>
              </div>
            </div>
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
