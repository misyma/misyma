import { FC, memo } from 'react';
import { FavoriteBookButton } from '../../../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';

import { Navigate, createLazyFileRoute } from '@tanstack/react-router';
import { AuthenticatedLayout } from '../../../../../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { BookTabLayout } from '../../../../../../modules/book/layouts/bookTabLayout.js';
import { BookTabNavigation } from '../../../../../../modules/book/components/bookTabNavigation/bookTabNavigation.js';
import { BasicDataTabActionButtons } from '../../../../../../modules/book/components/basicDataTab/basicDataTabActionButtons.js';
import { BasicDataMainBody } from '../../../../../../modules/book/components/basicDataTab/basicDataMainBody.js';
import { useBookBreadcrumbs } from '../../../../../../modules/book/hooks/useBookBreadcrumbs.js';

const MemoizedBookTabNavigation = memo(BookTabNavigation);
const MemoizedBasicDataTabActionButtons = memo(BasicDataTabActionButtons);
const MemoizedFavoriteBookButton = memo(FavoriteBookButton);
const MemoizedBasicDataMainBody = memo(BasicDataMainBody);

export const BasicDataPage: FC = () => {
  const { bookId } = Route.useParams();

  useBookBreadcrumbs({
    bookId,
  });

  if (bookId === '') {
    return <Navigate to="/login" />;
  }

  return (
    <AuthenticatedLayout>
      <BookTabLayout
        bookId={bookId}
        NavigationSlot={
          <MemoizedBookTabNavigation bookId={bookId} currentTab="basicData" />
        }
        ActionsSlot={<MemoizedBasicDataTabActionButtons bookId={bookId} />}
        ButtonSlot={<MemoizedFavoriteBookButton bookId={bookId} />}
        MainBodySlot={<MemoizedBasicDataMainBody bookId={bookId} />}
      />
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/shelves/bookshelf/book/tabs/basicDataTab/$bookId')({
  component: BasicDataPage,
});
