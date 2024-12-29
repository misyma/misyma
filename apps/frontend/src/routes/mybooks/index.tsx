import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
import { FilterComponentProps } from '../../modules/common/types/filter.js';
import { z } from 'zod';
import { FiltersDrawer } from '../../modules/common/components/filtersDrawer/filtersDrawer.js';
import { VirtualizedBooksList } from '../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList.js';
import {
  myBooksStateSelectors,
  setAuthorId,
  setFilterVisible,
  setGenreId,
  setIsFavorite,
  setLanguage,
  setReleaseYearAfter,
  setStatus,
  setTitle,
} from '../../modules/core/store/states/myBooksFilterState/myBooksFilterStateSlice.js';
import { HiPlus } from 'react-icons/hi2';
import { Input } from '../../modules/common/components/input/input.js';
import { Language, ReadingStatus } from '@common/contracts';
import { SearchLanguageSelect } from '../../modules/common/components/searchLanguageSelect/SearchLanguageSelect.js';
import { FilterContainer } from '../../modules/common/components/filter/filterContainer.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../modules/common/components/select/select.js';
import { useErrorHandledQuery } from '../../modules/common/hooks/useErrorHandledQuery.js';
import { getGenresQueryOptions } from '../../modules/genres/api/queries/getGenresQuery/getGenresQueryOptions.js';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice.js';
import { ReadingStatus as TranslatedReadingStatus } from '../../modules/common/constants/readingStatus.js';
import {
  ThreeStateCheckboxFilter,
  YearFilter,
} from '../../modules/common/components/filter/filter.js';
import useDebounce from '../../modules/common/hooks/useDebounce.js';
import { AuthorSearchFilter } from '../../modules/common/components/filter/AuthorSearchFilter.js';

const GenreSelectFilter: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  onRemoveFilter,
  setFilterAction,
}) => {
  const [genreSelectOpen, setGenreSelectOpen] = useState(false);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: genres } = useErrorHandledQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    })
  );

  return (
    <FilterContainer
      filter={filter}
      hasValue={!!initialValue}
      slot={
        <Select
          key={initialValue}
          value={initialValue}
          open={genreSelectOpen}
          onOpenChange={setGenreSelectOpen}
          onValueChange={setFilterAction}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                <span className="text-muted-foreground">Kategoria</span>
              }
            />
            <SelectContent>
              {Object.values(genres?.data ?? []).map((genre) => (
                <SelectItem
                  key={genre.id}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setGenreSelectOpen(false);
                    }
                  }}
                  value={genre.id}
                >
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectTrigger>
        </Select>
      }
      onRemoveFilter={onRemoveFilter}
    />
  );
};

const MyBooksStatusFilter: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  onRemoveFilter,
  setFilterAction,
}) => {
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);

  return (
    <FilterContainer
      filter={filter}
      onRemoveFilter={onRemoveFilter}
      hasValue={!!initialValue}
      slot={
        <Select
          key={initialValue}
          value={initialValue}
          open={statusSelectOpen}
          onOpenChange={setStatusSelectOpen}
          onValueChange={setFilterAction}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                <span className="text-muted-foreground">Status</span>
              }
            />
            <SelectContent>
              {Object.entries(TranslatedReadingStatus).map(([key, status]) => (
                <SelectItem
                  key={key + status}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setStatusSelectOpen(false);
                    }
                  }}
                  value={key}
                >
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectTrigger>
        </Select>
      }
    />
  );
};

const BookPageFiltersBar = () => {
  const dispatch = useDispatch();
  const navigate = Route.useNavigate();

  const search = Route.useSearch();

  const [filters, setFilters] = useState<
    z.infer<typeof myBooksSearchParamsSchema>
  >({
    genre: search.genre,
    language: search.language,
    releaseYearAfter: search.releaseYearAfter,
    status: search.status,
    authorId: search.authorId,
    isFavorite: search.isFavorite,
  });

  const language = useSelector(myBooksStateSelectors.getLanguage);
  const releaseYearAfter = useSelector(
    myBooksStateSelectors.getReleaseYearAfter
  );

  const onClearAll = () => {
    dispatch(setLanguage(''));
    dispatch(setReleaseYearAfter(undefined));
    dispatch(setTitle(''));
    dispatch(setGenreId(''));
    dispatch(setStatus(''));
    setFilters({});
    navigate({
      to: '',
      search: {},
    });
  };

  const onApplyFilters = () => {
    if (search.language !== filters.language) {
      dispatch(setLanguage(filters.language));
    }
    if (search.releaseYearAfter !== filters.releaseYearAfter) {
      dispatch(setReleaseYearAfter(filters.releaseYearAfter));
    }
    if (search.genre !== filters.genre) {
      dispatch(setGenreId(filters.genre as string));
    }
    if (search.status !== filters.status) {
      dispatch(setStatus(filters.status as string));
    }
    if (search.isFavorite !== filters.isFavorite) {
      dispatch(setIsFavorite(filters.isFavorite));
    }
    if (search.authorId !== filters.authorId) {
      dispatch(setAuthorId(filters.authorId));
    }
    navigate({
      to: '',
      search: filters,
    });
  };

  const onClearFilter = useCallback(
    (filterKey: keyof typeof filters) => {
      setFilters({
        ...filters,
        [filterKey]: undefined,
      });
    },
    [filters]
  );

  // TODO: think about it
  useEffect(() => {
    if (search.language !== language) {
      dispatch(setLanguage(language));
    }
    if (search.releaseYearAfter !== releaseYearAfter) {
      dispatch(setReleaseYearAfter(releaseYearAfter));
    }
    if (search.genre !== filters.genre) {
      dispatch(setGenreId(filters.genre as string));
    }
    if (search.status !== filters.status) {
      dispatch(setStatus(filters.status as string));
    }
    // purposeful - only sync redux with search params on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FiltersDrawer
      className="grid grid-cols-3"
      onApplyFilters={onApplyFilters}
      onClearAll={onClearAll}
    >
      <AuthorSearchFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            authorId: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('authorId')}
        initialValue={filters['authorId']}
        filter={{
          id: 'author-ids-filter',
          key: 'authorIds',
          label: 'Autor',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              authorId: val,
            });
          },
        }}
      />
      <SearchLanguageSelect
        key={filters.language}
        onRemoveFilter={() => onClearFilter('language')}
        initialValue={filters.language}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            language: val,
          });
        }}
        filter={{
          id: 'language-filter',
          key: 'language',
          label: 'Język',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              language: val,
            });
          },
        }}
      />
      <YearFilter
        initialValue={filters.releaseYearAfter as unknown as string}
        onRemoveFilter={() => onClearFilter('releaseYearAfter')}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            releaseYearAfter: val,
          });
        }}
        filter={{
          id: 'release-year-after-filter',
          key: 'releaseYearAfter',
          label: 'Wydana po',
          type: 'date',
          dateRangeSiblingId: 'release-year-before-filter',
          isAfterFilter: true,
          isBeforeFilter: false,
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              releaseYearAfter: val,
            });
          },
        }}
      />
      <GenreSelectFilter
        initialValue={filters.genre}
        onRemoveFilter={() => onClearFilter('genre')}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            genre: val,
          });
        }}
        filter={{
          id: 'category-filter',
          key: 'categoryFilter',
          label: 'Kategoria',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              releaseYearAfter: val,
            });
          },
        }}
      />
      <MyBooksStatusFilter
        initialValue={filters.status}
        onRemoveFilter={() => onClearFilter('status')}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            status: val,
          });
        }}
        filter={{
          id: 'status-filter',
          type: 'text',
          label: 'Status',
          key: 'statusFilter',
        }}
      />
      <ThreeStateCheckboxFilter
        initialValue={filters?.isFavorite}
        onRemoveFilter={() => onClearFilter('isFavorite')}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            isFavorite: `${val}` as '' | 'true' | 'false' | undefined,
          });
        }}
        filter={{
          id: 'is-favorite-filter',
          key: 'isFavorite',
          label: 'Ulubiona',
          type: 'three-state-checkbox',
          initialValue: filters?.isFavorite,
        }}
      />
    </FiltersDrawer>
  );
};

const MyBooksVirtualizedBooksList = () => {
  const isFavoriteStateMap = {
    true: true,
    false: false,
    '': undefined,
  };
  const {
    genre: genreId,
    language,
    releaseYearAfter,
    status,
    title,
    authorId,
    isFavorite,
  } = Route.useSearch();

  return (
    <VirtualizedBooksList
      booksQueryArgs={{
        language,
        title,
        releaseYearAfter,
        status,
        genreId,
        authorId,
        isFavorite: isFavoriteStateMap[isFavorite ?? ''],
      }}
    />
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
      <MyBooksVirtualizedBooksList />
    </motion.div>
  );
};

const BooksFiltersVisibilityButton = () => {
  const isFilterVisible = useSelector(
    myBooksStateSelectors.getFilterVisibility
  );
  const dispatch = useDispatch();

  const search = Route.useSearch();

  const filtersApplied = useMemo(() => {
    return (
      Object.entries(search)
        .filter(([key]) => !['page', 'pageSize'].includes(key))
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
                <div className="absolute h-4 w-4 top-[-10px] right-[-8px] rounded-full bg-green-500"></div>
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

const CreateBookButton = () => {
  const navigate = useNavigate();

  return (
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
  );
};

const TitleSearchField = () => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchedName, setSearchedName] = useState<string | undefined>(
    search.title
  );

  const debouncedSearchedName = useDebounce(searchedName, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, title: debouncedSearchedName }),
    });
  }, [debouncedSearchedName, navigate]);

  return (
    <div className="pl-4 flex flex-col gap-2">
      <Input
        onChange={(e) => {
          setSearchedName(e.target.value);
        }}
        className=""
        placeholder="Wyszukaj po tytule..."
      />
    </div>
  );
};

const View: FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
        <div className="w-full px-8 flex justify-between items-center gap-4 pb-4">
          <TitleSearchField />
          <div className="flex items-center gap-4">
            <BooksFiltersVisibilityButton />
            <CreateBookButton />
          </div>
        </div>
        <BooksPage />
      </div>
    </AuthenticatedLayout>
  );
};

const myBooksSearchParamsSchema = z.object({
  title: z.string().min(3).catch('').optional(),
  language: z
    .nativeEnum(Language)
    .optional()
    .catch('' as Language),
  genre: z.string().optional().catch(''),
  status: z
    .nativeEnum(ReadingStatus)
    .optional()
    .catch('' as ReadingStatus),
  releaseYearAfter: z.number().int().min(1900).optional().catch(undefined),
  authorId: z.string().uuid().optional().catch(''),
  isFavorite: z.enum(['true', 'false', '']).optional().catch(''),
});

export const Route = createFileRoute('/mybooks/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  staticData: {},
  validateSearch: myBooksSearchParamsSchema,
});
