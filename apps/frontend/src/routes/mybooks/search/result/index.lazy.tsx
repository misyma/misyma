import { createLazyFileRoute } from '@tanstack/react-router';

import { SearchResultPage } from '../../../../modules/book/components/pages/searchResultPage';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';

export const Route = createLazyFileRoute('/mybooks/search/result/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchResultPage />
      </RequireAuthComponent>
    );
  },
});
