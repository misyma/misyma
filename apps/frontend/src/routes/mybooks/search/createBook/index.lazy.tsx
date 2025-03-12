import { createLazyFileRoute } from '@tanstack/react-router';

import { CreateBookPage } from '../../../../modules/book/page/createBookPage';
import { BookCreationProvider } from '../../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';

export const Route = createLazyFileRoute('/mybooks/search/createBook/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <BookCreationProvider>
          <CreateBookPage from="/mybooks/search/createBook/" />
        </BookCreationProvider>
      </RequireAuthComponent>
    );
  },
});
