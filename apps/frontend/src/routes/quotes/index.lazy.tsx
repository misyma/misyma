import { createLazyFileRoute, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { HiOutlineFilter } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '../../modules/common/components/button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../modules/common/components/tooltip/tooltip';
import { ContentLayout } from '../../modules/core/layouts/content/contentLayout';
import {
  quoteStateSelectors,
  setFilterVisible,
} from '../../modules/core/store/states/quotesFilterState/quoteFilterStateSlice';
import { QuotationsTabSortingButton } from '../../modules/quotes/components/quotationTabTable/quotationsTabSortingButton';
import { QuotesPageFilterBar } from '../../modules/quotes/components/quotesPageFilterBar/quotesPageFilterBar';
import { VirtualizedQuotesList } from '../../modules/quotes/components/virtualizedQuotesList/virtualizedQuotesList';

const BooksFiltersVisibilityButton = () => {
  const isFilterVisible = useSelector(quoteStateSelectors.getFilterVisibility);

  const dispatch = useDispatch();

  const search = useSearch({ strict: false });

  const filtersApplied = useMemo(() => {
    return (
      Object.entries(search)
        .filter(([key]) => !['page', 'pageSize', 'sortField', 'sortOrder', 'title'].includes(key))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => {
          return value !== undefined || value !== '';
        }).length > 0
    );
  }, [search]);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="big-icon"
            onClick={() => {
              dispatch(setFilterVisible(!isFilterVisible));
            }}
          >
            <div className="relative w-full">
              <div className="flex w-full items-center justify-center">
                <HiOutlineFilter className="w-8 h-8"></HiOutlineFilter>
              </div>
              {filtersApplied && (
                <div className="absolute h-4 w-4 top-[-10px] right-[-8px] rounded-full z-50 bg-green-500"></div>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Filtruj</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const QuotesPage = () => {
  const search = Route.useSearch();
  return (
    <div className="w-full flex flex-col">
      <div className="h-10 w-full flex justify-end items-center px-3 pb-2 gap-2">
        <BooksFiltersVisibilityButton />
        <QuotationsTabSortingButton from="/quotes" />
      </div>
      <QuotesPageFilterBar />
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
