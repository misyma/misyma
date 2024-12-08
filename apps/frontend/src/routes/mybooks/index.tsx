import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { createFileRoute } from '@tanstack/react-router';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent.js';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery.js';
import { Button } from '../../modules/common/components/button/button.js';
import { Bookshelf, BookshelfType } from '@common/contracts';
import { useFindUserBookshelfsQuery } from '../../modules/bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery.js';
import { useBreadcrumbKeysDispatch } from '../../modules/common/contexts/breadcrumbKeysContext.js';
import { ShelvesSkeleton } from '../../modules/bookshelf/components/bookshelvesSkeleton/shelvesSkeleton';
import { motion } from 'framer-motion';
import styles from './index.module.css';
import { Paginator } from '../../modules/common/components/paginator/paginator.js';
import { Input } from '../../modules/common/components/input/input.js';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { BookshelfsList } from '../../modules/bookshelf/components/bookshelfsList/bookshelfsList.js';
import { useBookshelfView } from '../../modules/core/store/hooks/useBookshelfView.js';
import { Switch } from '../../modules/common/components/switch/switch.js';
import { BookshelfView } from '../../modules/core/store/states/preferencesState/preferencesState.js';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../modules/core/store/store.js';
import {
  setBookshelves,
  setEditMap,
} from '../../modules/core/store/states/bookshelvesState/bookshelfStateSlice.js';
import {
  FilterProvider,
  useFilterContext,
} from '../../modules/common/contexts/filterContext.js';
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
import { DynamicFilterProvider } from '../../modules/common/contexts/dynamicFilterContext.js';
import { VirtualizedBooksList } from '../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList.js';

export const ShelvesPage: FC = () => {
  const breadcrumbKeysDispatch = useBreadcrumbKeysDispatch();
  const dispatch = useDispatch<AppDispatch>();

  const perPage = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchedName, setSearchedName] = useState('');

  const storeBookshelves = useSelector<RootState, Bookshelf[]>(
    (state) => state.bookshelves.bookshelves
  );
  const editMap = useSelector<RootState, Record<number, boolean>>(
    (state) => state.bookshelves.editMap
  );

  const { data: user } = useFindUserQuery();
  const {
    data: bookshelvesData,
    isLoading,
    isRefetching,
  } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: perPage,
    page: currentPage,
    name: searchedName,
  });
  const [queryBookshelves, setQueryBookshelves] = useState(
    bookshelvesData?.data
  );

  const dispatchBookshelvesUpdate = useCallback(() => {
    if (!bookshelvesData?.data) {
      return;
    }

    const updatedBookshelves = bookshelvesData.data.map((newBookshelf) => {
      const existingBookshelfIndex = storeBookshelves.findIndex(
        (storedBookshelf) => storedBookshelf.id === newBookshelf.id
      );
      if (existingBookshelfIndex === -1) {
        return newBookshelf;
      }

      const existingBookshelf = storeBookshelves[existingBookshelfIndex];
      return {
        ...existingBookshelf,
        ...newBookshelf,
        createdAt: existingBookshelf.createdAt,
      };
    });

    const finalBookshelves = [
      ...storeBookshelves.filter(
        (storedBookshelf) =>
          !updatedBookshelves.some(
            (updatedBookshelf) => updatedBookshelf.id === storedBookshelf.id
          )
      ),
      ...updatedBookshelves,
    ];

    if (updatedBookshelves.length > 0) {
      dispatch(setBookshelves(finalBookshelves));
    }
  }, [bookshelvesData?.data, storeBookshelves, dispatch]);

  useEffect(() => {
    breadcrumbKeysDispatch({
      clear: true,
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (bookshelvesData?.data) {
      setQueryBookshelves(bookshelvesData?.data);
    }
  }, [bookshelvesData]);

  useEffect(() => {
    if (queryBookshelves && queryBookshelves?.length > 0) {
      dispatchBookshelvesUpdate();
    }
    // Todo: figure out the infinite loop occurring here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryBookshelves]);

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelvesData?.metadata?.total ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
  }, [bookshelvesData?.metadata?.total]);

  if (isLoading && !isRefetching) {
    return <ShelvesSkeleton />;
  }

  const onAddNewBookshelf = (): void => {
    queryBookshelves?.unshift({
      id: '',
      name: '',
      userId: user?.id as string,
      type: BookshelfType.standard,
      createdAt: new Date().toISOString(),
    });

    dispatch(
      setEditMap({
        ...editMap,
        [0]: true,
      })
    );

    setIsCreatingNew(true);

    setQueryBookshelves([...(queryBookshelves ? queryBookshelves : [])]);
  };

  return (
    <motion.div
      key={'shelves-view'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={styles['page-container']}
    >
      <div className={styles['action-bar-container']}>
        <Input
          iSize="lg"
          placeholder="Wyszukaj półkę..."
          onChange={(e) => {
            setSearchedName(e.currentTarget.value);

            setCurrentPage(1);
          }}
          includeQuill={false}
          otherIcon={<HiMagnifyingGlass className="text-primary h-8 w-8" />}
        />
        <Button
          size="xl"
          onClick={() => onAddNewBookshelf()}
          disabled={isCreatingNew}
        >
          Dodaj nową półkę
        </Button>
      </div>
      <BookshelfsList
        onCreatingNew={(val) => setIsCreatingNew(val)}
        currentPage={currentPage}
        searchedName={searchedName}
      />
      {queryBookshelves &&
        (bookshelvesData?.metadata?.total ?? 0) > perPage && (
          <Paginator
            pagesCount={pagesCount}
            perPage={perPage}
            onPageChange={setCurrentPage}
            pageIndex={currentPage}
            includeArrows={true}
            itemsCount={bookshelvesData?.metadata.total}
          />
        )}
    </motion.div>
  );
};

const BookPageFiltersBar = () => {
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
      {
        id: 'release-year-before-filter',
        key: 'releaseYearBefore',
        label: 'Wydana przed',
        type: 'year',
        dateRangeSiblingId: 'release-year-after-filter',
        isAfterFilter: false,
        isBeforeFilter: true,
      },
    ],
    []
  );

  return (
    <DynamicFilterProvider initialValues={{}} filterOptions={filterOptions}>
      <FiltersDrawer
        className="grid grid-cols-3 px-2"
        onApplyFilters={() => {}}
      />
    </DynamicFilterProvider>
  );
};

const BooksPage: FC = () => {
  const { isFilterVisible } = useFilterContext();

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

const View: FC = () => {
  const { view, updateBookshelfView } = useBookshelfView();
  const { isFilterVisible, toggleFilterVisibility } = useFilterContext();

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
        <div className="flex items-center space-x-2"></div>
        <div className="w-full px-16 flex justify-between items-center gap-4 pb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-primary">
              {view === 'books' ? 'Książki' : 'Półki'}
            </h2>
            <Switch
              onClick={() => {
                const viewMap: Record<BookshelfView, BookshelfView> = {
                  books: 'shelves',
                  shelves: 'books',
                };
                updateBookshelfView(viewMap[view]);

                if (isFilterVisible) {
                  toggleFilterVisibility();
                }
              }}
              id="bookshelf-view-mode"
            />
          </div>
          <div className="flex items-center gap-4">
            {view === 'books' ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="big-icon" onClick={toggleFilterVisibility}>
                      <HiOutlineFilter className="w-8 h-8"></HiOutlineFilter>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filtruj</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
        </div>
        {view === 'books' ? <BooksPage /> : <ShelvesPage />}
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/mybooks/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <FilterProvider>
          <View />
        </FilterProvider>
      </RequireAuthComponent>
    );
  },
  staticData: {},
});
