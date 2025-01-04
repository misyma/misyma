import { useQueryClient } from '@tanstack/react-query';
import { Navigate, createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';

import { AuthenticatedLayout } from '../../../../../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { BookApiQueryKeys } from '../../../../../../modules/book/api/user/queries/bookApiQueryKeys.js';
import { AddStarRatingButton } from '../../../../../../modules/book/components/addStarRatingButton/addStarRatingButton.js';
import { BookTabNavigation } from '../../../../../../modules/book/components/bookTabNavigation/bookTabNavigation.js';
import { FavoriteBookButton } from '../../../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';
import { useBookBreadcrumbs } from '../../../../../../modules/book/hooks/useBookBreadcrumbs.js';
import { BookTabLayout } from '../../../../../../modules/book/layouts/bookTabLayout.js';
import { BookReadingsApiQueryKeys } from '../../../../../../modules/bookReadings/api/queries/bookReadingsApiQueryKeys.js';
import { BookGradesTabMainBody } from '../../../../../../modules/grades/components/bookGradesTabMainBody.js';
import { useFindUserQuery } from '../../../../../../modules/user/api/queries/findUserQuery/findUserQuery.js';

export const GradesPage: FC = () => {
  const { bookId } = Route.useParams();

  useBookBreadcrumbs({ bookId });

  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const invalidateReadingsFetch = () => {
    Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookReadingsApiQueryKeys.findBookReadings &&
          query.queryKey[1] === userData?.id &&
          query.queryKey[2] === bookId,
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findUserBooksBy && query.queryKey.includes('infinite-query'),
      }),
    ]);
  };

  return (
    <AuthenticatedLayout>
      <BookTabLayout
        bookId={bookId}
        NavigationSlot={
          <BookTabNavigation
            bookId={bookId}
            currentTab="grades"
          />
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

export const Route = createLazyFileRoute('/shelves/bookshelf/book/tabs/gradesTab/$bookId')({
  component: GradesPage,
});
