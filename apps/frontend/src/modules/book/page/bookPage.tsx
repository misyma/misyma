import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useParams, useSearch } from '@tanstack/react-router';
import { type FC } from 'react';

import { type SortOrder } from '@common/contracts';

import { AuthenticatedLayout } from '../../auth/layouts/authenticated/authenticatedLayout';
import { BookReadingsApiQueryKeys } from '../../bookReadings/api/queries/bookReadingsApiQueryKeys';
import { Button } from '../../common/components/button/button';
import { Separator } from '../../common/components/separator/separator';
import { CreateQuotationModal } from '../../quotes/components/createQuotationModal/createQuotationModal';
import { QuotationTabTable } from '../../quotes/components/quotationTabTable/quotationTabTable';
import { QuotationTabTitleBar } from '../../quotes/components/quotationTabTitleBar/quotationTabTitleBar';
import { useFindUserQuery } from '../../user/api/queries/findUserQuery/findUserQuery';
import { BookApiQueryKeys } from '../api/user/queries/bookApiQueryKeys';
import { AddStarRatingButton } from '../components/atoms/addStarRatingButton/addStarRatingButton';
import { FavoriteBookButton } from '../components/molecules/favoriteBookButton/favoriteBookButton';
import { BasicDataMainBody } from '../components/organisms/basicDataTab/basicDataMainBody';
import { BasicDataTabActionButtons } from '../components/organisms/basicDataTab/basicDataTabActionButtons';
import { BookGradesTabMainBody } from '../components/organisms/bookGradesTab/bookGradesTabMainBody';
import { BookTabNavigation } from '../components/organisms/bookTabNavigation/bookTabNavigation';
import { BookNavigationFromEnum, type BookNavigationFrom } from '../constants';
import { useBookBreadcrumbs } from '../hooks/useBookBreadcrumbs';
import { BookTabLayout } from '../layouts/bookTabLayout';

export const BookPage: FC<{ from: BookNavigationFrom }> = ({ from }) => {
  const fromUrl = from === BookNavigationFromEnum.shelves ? '/shelves/bookshelf/book/$bookId' : '/mybooks/book/$bookId';
  const { bookId } = useParams({ from: fromUrl }) as {
    bookId: string;
  };
  const { sortDate, view } = useSearch({ from: fromUrl }) as {
    sortDate: SortOrder;
    view: 'basicData' | 'quotations' | 'grades';
  };

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
  const renderMainBody = () => {
    switch (view) {
      case 'basicData':
        return <BasicDataMainBody bookId={bookId} />;
      case 'grades':
        return <BookGradesTabMainBody bookId={bookId} />;
      case 'quotations':
        return (
          <>
            <QuotationTabTitleBar bookId={bookId} />
            <Separator className="h-[1px] bg-primary"></Separator>
            <QuotationTabTable
              bookId={bookId}
              sortDate={sortDate}
            />
          </>
        );
    }
  };
  const renderButtonSlot = () => {
    return <FavoriteBookButton bookId={bookId} />;
  };
  const renderActionsSlot = () => {
    switch (view) {
      case 'basicData':
        return <BasicDataTabActionButtons bookId={bookId} />;
      case 'grades':
        return (
          <div className="flex justify-center items-end flex-col">
            <p>Dodaj ocenę</p>
            <AddStarRatingButton
              onCreated={async () => await invalidateReadingsFetch()}
              userBookId={bookId}
            />
          </div>
        );
      case 'quotations':
        return (
          <CreateQuotationModal
            onMutated={() => {}}
            trigger={<Button size="xl">Dodaj cytat</Button>}
            userBookId={bookId}
          />
        );
    }
  };

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <BookTabLayout
        bookId={bookId}
        NavigationSlot={
          <BookTabNavigation
            from={from}
            bookId={bookId}
            currentTab={view}
          />
        }
        ActionsSlot={renderActionsSlot()}
        ButtonSlot={renderButtonSlot()}
        MainBodySlot={renderMainBody()}
      />
    </AuthenticatedLayout>
  );
};
