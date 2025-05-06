import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useParams, useSearch } from '@tanstack/react-router';
import { type FC } from 'react';

import { type SortOrder } from '@common/contracts';

import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';
import { BookReadingsApiQueryKeys } from '../../../bookReadings/api/queries/bookReadingsApiQueryKeys';
import { Button } from '../../../common/components/button/button';
import { Separator } from '../../../common/components/separator/separator';
import { CreateQuotationModal } from '../../../quotes/components/organisms/createQuotationModal/createQuotationModal';
import { QuotationTabTable } from '../../../quotes/components/organisms/quotationTabTable/quotationTabTable';
import { QuotationTabTitleBar } from '../../../quotes/components/organisms/quotationTabTitleBar/quotationTabTitleBar';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { BookNavigationFromEnum, type BookNavigationFrom } from '../../constants';
import { useBookBreadcrumbs } from '../../hooks/useBookBreadcrumbs';
import { BookTabLayout } from '../../layouts/bookTabLayout';
import { AddStarRatingButton } from '../atoms/addStarRatingButton/addStarRatingButton';
import { FavoriteBookButton } from '../atoms/favoriteBookButton/favoriteBookButton';
import { BasicDataMainBody } from '../organisms/basicDataTab/basicDataMainBody';
import { BasicDataTabActionButtons } from '../organisms/basicDataTab/basicDataTabActionButtons';
import { BookGradesTabMainBody } from '../organisms/bookGradesTab/bookGradesTabMainBody';
import { BookTabNavigation } from '../organisms/bookTabNavigation/bookTabNavigation';
import { BookPageContentCard } from '../atoms/bookPageContentCard/bookPageContentCard';

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

  const invalidateReadingsFetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookReadingsApiQueryKeys.findBookReadings && query.queryKey[2] === bookId,
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
          <BookPageContentCard>
            <QuotationTabTitleBar bookId={bookId} />
            <Separator className="h-[2px] bg-primary/20" />
            <QuotationTabTable
              bookId={bookId}
              sortDate={sortDate}
            />
          </BookPageContentCard>
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
            onMutated={async () => {}}
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
