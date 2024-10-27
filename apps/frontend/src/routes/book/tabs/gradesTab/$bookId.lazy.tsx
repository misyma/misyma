import { FC } from 'react';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery.js';
import { useQueryClient } from '@tanstack/react-query';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';
import { BookReadingsApiQueryKeys } from '../../../../modules/bookReadings/api/queries/bookReadingsApiQueryKeys.js';
import { AddStarRatingButton } from '../../../../modules/book/components/addStarRatingButton/addStarRatingButton.js';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { BookTabLayout } from '../../../../modules/book/layouts/bookTabLayout.js';
import { BookTabNavigation } from '../../../../modules/book/components/bookTabNavigation/bookTabNavigation.js';
import { useBookBreadcrumbs } from '../../../../modules/book/hooks/useBookBreadcrumbs.js';
import { BookGradesTabMainBody } from '../../../../modules/grades/components/bookGradesTabMainBody.js';

export const GradesPage: FC = () => {
  const { bookId } = Route.useParams();

  useBookBreadcrumbs({ bookId });

  const queryClient = useQueryClient();
  const { data: userData } = useFindUserQuery();

  const invalidateReadingsFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === BookReadingsApiQueryKeys.findBookReadings &&
        query.queryKey[1] === userData?.id &&
        query.queryKey[2] === bookId,
    });

  return (
    <AuthenticatedLayout>
      <BookTabLayout
        bookId={bookId}
        NavigationSlot={
          <BookTabNavigation bookId={bookId} currentTab="grades" />
        }
        ActionsSlot={
          <div className="flex justify-center items-end flex-col">
            <p>Dodaj ocenę</p>
            <AddStarRatingButton
              onCreated={async () => await invalidateReadingsFetch()}
              userBookId={bookId}
            />
          </div>
        }
        MainBodySlot={<BookGradesTabMainBody bookId={bookId} />}
        ButtonSlot={<FavoriteBookButton bookId={bookId} />}
      />
      {bookId === '' ? <Navigate to={'/login'} /> : null}
    </AuthenticatedLayout>
  );
};

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/book/tabs/gradesTab/$bookId')({
  component: GradesPage,
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
      {
        readableName: 'Oceny',
        href: '/book/tabs/gradesTab/$bookId',
      },
    ],
  },
});
