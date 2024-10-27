import { FC } from 'react';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton';
import { Separator } from '@radix-ui/react-select';
import { Button } from '../../../../modules/common/components/button/button';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { CreateQuotationModal } from '../../../../modules/quotes/components/createQuotationModal/createQuotationModal';
import { BookTabLayout } from '../../../../modules/book/layouts/bookTabLayout';
import { QuotationTabTitleBar } from '../../../../modules/quotes/components/quotationTabTitleBar/quotationTabTitleBar';
import { BookTabNavigation } from '../../../../modules/book/components/bookTabNavigation/bookTabNavigation';
import { QuotationTabTable } from '../../../../modules/quotes/components/quotationTabTable/quotationTabTable';
import { useBookBreadcrumbs } from '../../../../modules/book/hooks/useBookBreadcrumbs';

export const QuotesPage: FC = () => {
  const { bookId } = Route.useParams();

  useBookBreadcrumbs({ bookId });

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <BookTabLayout
        NavigationSlot={
          <BookTabNavigation bookId={bookId} currentTab="quotations" />
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

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/book/tabs/quotationsTab/$bookId')({
  component: QuotesPage,
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
        readableName: 'Cytaty',
        href: '/book/tabs/quotationsTab/$bookId',
      },
    ],
  },
});
