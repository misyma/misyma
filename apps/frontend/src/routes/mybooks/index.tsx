import { FC, useMemo } from 'react';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent.js';
import { Button } from '../../modules/common/components/button/button.js';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../modules/common/components/tooltip/tooltip.js';
import { HiOutlineFilter } from 'react-icons/hi';
import { FilterOpts } from '../../modules/common/types/filter.js';
import { z } from 'zod';
import { SearchLanguageSelect } from '../../modules/book/components/adminBookSearchFilters/adminBookSearchFilters.js';
import { FiltersDrawer } from '../../modules/common/components/filtersDrawer/filtersDrawer.js';
import {
  DynamicFilterProvider,
  DynamicFilterValues,
} from '../../modules/common/contexts/dynamicFilterContext.js';
import { VirtualizedBooksList } from '../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList.js';
import {
  myBooksStateSelectors,
  setFilterVisible,
  setLanguage,
  setReleasedAfter,
  setTitle,
} from '../../modules/core/store/states/myBooksFilterState/myBooksFilterStateSlice.js';
import { HiPlus } from 'react-icons/hi2';

const BookPageFiltersBar = () => {
  const dispatch = useDispatch();
  const filterOptions = useMemo(
    (): FilterOpts[] => [
      {
        id: 'title-filter',
        key: 'title',
        label: 'Tytuł',
        type: 'text',
        schema: z.string().min(3),
      },
      {
        id: 'language-filter',
        key: 'language',
        label: 'Język',
        type: 'text',
        customSlot: SearchLanguageSelect,
      },
      {
        id: 'release-year-after-filter',
        key: 'releaseYearAfter',
        label: 'Wydana po',
        type: 'year',
        dateRangeSiblingId: 'release-year-before-filter',
        isAfterFilter: true,
        isBeforeFilter: false,
      },
    ],
    []
  );

  const onApplyFilters = (vals: DynamicFilterValues) => {
    if (vals['language']) {
      dispatch(setLanguage(vals['language'] as string));
    }
    if (vals['releaseAfter']) {
      dispatch(setReleasedAfter(vals['releaseAfter'] as Date));
    }
    if (vals['title']) {
      dispatch(setTitle(vals['title'] as string));
    }
  };

  const onClearAll = () => {
    dispatch(setLanguage(''));
    dispatch(setReleasedAfter(undefined));
    dispatch(setTitle(''));
  };

  return (
    <DynamicFilterProvider initialValues={{}} filterOptions={filterOptions}>
      <FiltersDrawer
        className="grid grid-cols-3 px-2"
        onApplyFilters={onApplyFilters}
        onClearAll={onClearAll}
      />
    </DynamicFilterProvider>
  );
};

const BooksPage: FC = () => {
  const isFilterVisible = useSelector(
    myBooksStateSelectors.getFilterVisibility
  );

  return (
    <motion.div
      key={'books-view'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full px-8"
    >
      {isFilterVisible && <BookPageFiltersBar />}
      <VirtualizedBooksList />
    </motion.div>
  );
};

const BooksFiltersVisibilityButton = () => {
  const isFilterVisible = useSelector(
    myBooksStateSelectors.getFilterVisibility
  );
  const dispatch = useDispatch();

  return (
    <Button
      size="big-icon"
      onClick={() => {
        dispatch(setFilterVisible(!isFilterVisible));
      }}
    >
      <HiOutlineFilter className="w-8 h-8"></HiOutlineFilter>
    </Button>
  );
};

const View: FC = () => {
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
        <div className="w-full px-8 flex justify-end items-center gap-4 pb-4">
          <div className="flex items-center gap-4">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BooksFiltersVisibilityButton />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtruj</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="big-icon"
                    onClick={() => {
                      navigate({
                        to: `/shelves/bookshelf/search`,
                        search: {
                          type: 'isbn',
                          next: 0,
                        },
                      });
                    }}
                  >
                    <HiPlus className="w-8 h-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stwórz książkę</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <BooksPage />
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/mybooks/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  staticData: {},
});
