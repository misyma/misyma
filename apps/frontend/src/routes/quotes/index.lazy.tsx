import { createLazyFileRoute } from '@tanstack/react-router';

import { ContentLayout } from '../../modules/core/layouts/content/contentLayout';
import { VirtualizedQuotesList } from '../../modules/quotes/components/virtualizedQuotesList/virtualizedQuotesList';

const QuotesPage = () => {
  return <VirtualizedQuotesList />;
};

export const Route = createLazyFileRoute('/quotes/')({
  component: () => (
    <ContentLayout>
      <QuotesPage />
    </ContentLayout>
  ),
});
