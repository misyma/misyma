import { FC } from 'react';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';

import { Navigate, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { BookTabLayout } from '../../../../modules/book/layouts/bookTabLayout.js';
import { BookTabNavigation } from '../../../../modules/book/components/bookTabNavigation/bookTabNavigation.js';
import { BasicDataTabActionButtons } from '../../../../modules/book/components/basicDataTab/basicDataTabActionButtons.js';
import { BasicDataMainBody } from '../../../../modules/book/components/basicDataTab/basicDataMainBody.js';

export const BasicDataPage: FC = () => {
  const { bookId } = Route.useParams();

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <BookTabLayout
        bookId={bookId}
        NavigationSlot={
          <BookTabNavigation bookId={bookId} currentTab="basicData" />
        }
        ActionsSlot={<BasicDataTabActionButtons bookId={bookId} />}
        ButtonSlot={<FavoriteBookButton bookId={bookId} />}
        MainBodySlot={<BasicDataMainBody bookId={bookId} />}
      />
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
