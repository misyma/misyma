import { Separator } from '@radix-ui/react-select';
import { Navigate, createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';

import { AuthenticatedLayout } from '../../../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { BookTabNavigation } from '../../../../../../modules/book/components/bookTabNavigation/bookTabNavigation';
import { FavoriteBookButton } from '../../../../../../modules/book/components/favoriteBookButton/favoriteBookButton';
import { useBookBreadcrumbs } from '../../../../../../modules/book/hooks/useBookBreadcrumbs';
import { BookTabLayout } from '../../../../../../modules/book/layouts/bookTabLayout';
import { Button } from '../../../../../../modules/common/components/button/button';
import { CreateQuotationModal } from '../../../../../../modules/quotes/components/createQuotationModal/createQuotationModal';
import { QuotationTabTable } from '../../../../../../modules/quotes/components/quotationTabTable/quotationTabTable';
import { QuotationTabTitleBar } from '../../../../../../modules/quotes/components/quotationTabTitleBar/quotationTabTitleBar';

export const QuotesPage: FC = () => {
  const { bookId } = Route.useParams();

  useBookBreadcrumbs({ bookId });

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <BookTabLayout
        NavigationSlot={
          <BookTabNavigation
            bookId={bookId}
            currentTab="quotations"
          />
        }
        ActionsSlot={
          <CreateQuotationModal
            onMutated={() => {}}
            trigger={<Button size="xl">Dodaj cytat</Button>}
            userBookId={bookId}
          />
        }
        ButtonSlot={<FavoriteBookButton bookId={bookId} />}
        MainBodySlot={
          <>
            <QuotationTabTitleBar bookId={bookId} />
            <Separator className="h-[1px] bg-primary"></Separator>
            <QuotationTabTable bookId={bookId} />
          </>
        }
        bookId={bookId}
      />
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/shelves/bookshelf/book/tabs/quotationsTab/$bookId')({
  component: QuotesPage,
});
