import { FC, useMemo } from 'react';
import { StarRating } from '../../../../modules/bookReadings/components/starRating/starRating.js';
import { StatusChooserCards } from '../../../../modules/book/components/statusChooser/statusChooserCards.js';
import { BookshelfChoiceDropdown } from '../../../../modules/book/components/bookshelfChoiceDropdown/bookshelfChoiceDropdown.js';
import { Separator } from '../../../../modules/common/components/ui/separator.js';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';
import { UserBook } from '@common/contracts';
import { CurrentRatingStar } from '../../../../modules/book/components/currentRatingStar/currentRatingStar.js';
import { BookFormat } from '../../../../modules/common/constants/bookFormat.js';
import { ReversedLanguages } from '../../../../modules/common/constants/languages.js';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice.js';

import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { cn } from '../../../../modules/common/lib/utils.js';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery.js';
import { FindUserBookByIdQueryOptions } from '../../../../modules/book/api/user/queries/findUserBook/findUserBookByIdQueryOptions.js';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../../../modules/common/contexts/breadcrumbKeysContext.js';
import { useFindBookshelfByIdQuery } from '../../../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery.js';
import { BasicDataTabSkeleton } from '../../../../modules/book/components/basicDataSkeleton/basicDataTabSkeleton.js';

import { DeleteBookModal } from '../../../../modules/book/components/deleteBookModal/deleteBookModal.js';
import { CreateChangeRequestModal } from '../../../../modules/book/components/createChangeRequestModal/createChangeRequestModal.js';
import { EditBookModal } from '../../../../modules/book/components/editBookModal/editBookModal.js';

export const BasicDataPage: FC = () => {
  const { data: userData } = useFindUserQuery();

  const navigate = useNavigate();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { bookId } = Route.useParams();

  const dispatch = useBreadcrumbKeysDispatch();

  const breadcrumbKeys = useBreadcrumbKeysContext();

  const { data, isFetched, isFetching, isRefetching } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(data?.bookshelfId as string);

  if (data?.book.title && !breadcrumbKeys['$bookName']) {
    dispatch({
      key: '$bookName',
      value: data?.book.title,
    });
  }

  if (!breadcrumbKeys['$bookId']) {
    dispatch({
      key: '$bookId',
      value: bookId,
    });
  }

  if (bookshelfResponse?.id && !breadcrumbKeys['$bookshelfName']) {
    dispatch({
      key: '$bookshelfName',
      value: bookshelfResponse.name,
    });

    dispatch({
      key: '$bookshelfId',
      value: data?.bookshelfId,
    });
  }

  const imageUrl = useMemo(() => data?.imageUrl, [data?.imageUrl]);

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="col-span-2 sm:col-start-1 sm:col-span-5 flex justify-between">
            {/* sm:visible otherwise dropdown component visible */}
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <li className={cn('cursor-default text-primary font-bold')}>Dane podstawowe</li>
              <li
                className={cn('cursor-pointer')}
                onClick={() =>
                  navigate({
                    to: `/book/tabs/quotationsTab/${bookId}`,
                  })
                }
              >
                Cytaty
              </li>
              <li
                className={cn('cursor-pointer')}
                onClick={() =>
                  navigate({
                    to: `/book/tabs/gradesTab/${bookId}`,
                  })
                }
              >
                Oceny
              </li>
            </ul>
            <div className="flex gap-4 p-2">
              <CreateChangeRequestModal bookId={bookId} />
              <EditBookModal bookId={bookId} />
              <DeleteBookModal
                bookId={bookId}
                bookName={data?.book.title ?? ''}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
            {isFetching && !isRefetching && <BasicDataTabSkeleton bookId={bookId} />}
            {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
              <>
                <div>
                  <img
                    key={`${imageUrl}`}
                    src={imageUrl || '/book.jpg'}
                    className="object-cover max-w-80"
                  />
                </div>
                <div className="flex justify-center">
                  <FavoriteBookButton userBook={data as UserBook} />
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full">
                    <p className="font-semibold text-3xl">{data?.book.title}</p>
                    <CurrentRatingStar userBookId={bookId} />
                  </div>
                  <Separator className="h-[1px] bg-primary"></Separator>
                  <div className="flex w-full justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-lg pb-6">{data?.book.authors[0]?.name}</p>
                      {data?.book.isbn && <p>ISBN: {data?.book.isbn}</p>}
                      {data?.book.releaseYear && <p>Rok wydania: {data?.book.releaseYear}</p>}
                      <p>Język: {data?.book.language ? ReversedLanguages[data?.book.language]?.toLowerCase() : ''}</p>
                      {data?.book.translator && <p>Tłumacz: {data?.book.translator}</p>}
                      <p>Format: {data?.book.format ? BookFormat[data?.book.format] : ''}</p>
                      {data?.book.pages && <p>Liczba stron: {data?.book.pages}</p>}
                      {data?.genres[0]?.name && <p>Kategoria: {data?.genres[0]?.name}</p>}
                    </div>
                    <div className="flex gap-12 flex-col items-end justify-start">
                      <BookshelfChoiceDropdown
                        currentBookshelfId={data?.bookshelfId ?? ''}
                        bookId={data?.id ?? ''}
                      />
                      <div className="flex flex-col text-lg items-end gap-2">
                        <p>Status</p>
                        <StatusChooserCards
                          bookshelfId={data?.bookshelfId ?? ''}
                          bookId={data?.id ?? ''}
                        ></StatusChooserCards>
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

export const Route = createFileRoute('/book/tabs/basicDataTab/$bookId')({
  component: BasicDataPage,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
      {
        readableName: '$bookshelfName',
        href: '/bookshelf/$bookshelfId',
      },
      {
        readableName: '$bookName',
        href: '/book/tabs/basicDataTab/$bookId',
      },
    ],
  },
});
