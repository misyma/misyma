import { createLazyFileRoute } from '@tanstack/react-router';

import { SearchResultPage } from '../../../../../modules/book/page/searchResultPage';
import { RequireAuthComponent } from '../../../../../modules/core/components/requireAuth/requireAuthComponent';

export const Route = createLazyFileRoute('/shelves/bookshelf/search/result/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchResultPage from="/shelves/bookshelf/search/result/" />
      </RequireAuthComponent>
    );
  },
});
