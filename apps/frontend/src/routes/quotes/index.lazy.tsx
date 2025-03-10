import { createLazyFileRoute } from '@tanstack/react-router';

import { ContentLayout } from '../../modules/core/layouts/content/contentLayout';
import { QuotationsTabSortingButton } from '../../modules/quotes/components/quotationTabTable/quotationsTabSortingButton';
import { VirtualizedQuotesList } from '../../modules/quotes/components/virtualizedQuotesList/virtualizedQuotesList';

const QuotesPage = () => {
  const search = Route.useSearch();
  return (
    <div className="w-full flex flex-col">
      <div className="h-10 w-full flex justify-end items-center px-3 pb-2">
        <QuotationsTabSortingButton from="/quotes" />
      </div>
      <VirtualizedQuotesList queryArgs={search} />
    </div>
  );
};

export const Route = createLazyFileRoute('/quotes/')({
  component: () => (
    <ContentLayout>
      <QuotesPage />
    </ContentLayout>
  ),
});
