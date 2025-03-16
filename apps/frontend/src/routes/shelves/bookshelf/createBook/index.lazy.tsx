import { createLazyFileRoute } from '@tanstack/react-router';

import { CreateBookPage } from '../../../../modules/book/components/pages/createBookPage';
import { BookCreationProvider } from '../../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';

export const Route = createLazyFileRoute('/shelves/bookshelf/createBook/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <BookCreationProvider>
          <CreateBookPage from="/shelves/bookshelf/createBook/" />
        </BookCreationProvider>
      </RequireAuthComponent>
    );
  },
});
