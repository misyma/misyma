import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { Language, ReadingStatus, SortingType } from '@common/contracts';

import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { BooksPageTopBar } from '../../modules/book/components/booksPageTopBar/booksPageTopBar.js';
import { VirtualizedBooksList } from '../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList.js';
import { Button } from '../../modules/common/components/button/button.js';
import { AuthorSearchFilter } from '../../modules/common/components/filter/AuthorSearchFilter.js';
import { ThreeStateCheckboxFilter, YearRangeFilter } from '../../modules/common/components/filter/filter.js';
import { FilterContainer } from '../../modules/common/components/filter/filterContainer.js';
import { FiltersDrawer } from '../../modules/common/components/filtersDrawer/filtersDrawer.js';
import { Input } from '../../modules/common/components/input/input.js';
import { SearchLanguageSelect } from '../../modules/common/components/searchLanguageSelect/SearchLanguageSelect.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../modules/common/components/select/select.js';
import { ReadingStatus as TranslatedReadingStatus } from '../../modules/common/constants/readingStatus.js';
import useDebounce from '../../modules/common/hooks/useDebounce.js';
import { useErrorHandledQuery } from '../../modules/common/hooks/useErrorHandledQuery.js';
import { type FilterComponentProps } from '../../modules/common/types/filter.js';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent.js';
import {
  myBooksStateSelectors,
  setAuthorId,
  setGenreId,
  setIsFavorite,
  setLanguage,
  setReleaseYearAfter,
  setReleaseYearBefore,
  setStatus,
} from '../../modules/core/store/states/myBooksFilterState/myBooksFilterStateSlice.js';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice.js';
import { getGenresQueryOptions } from '../../modules/genres/api/queries/getGenresQuery/getGenresQueryOptions.js';

const GenreSelectFilter: FC<FilterComponentProps> = ({ filter, initialValue, onRemoveFilter, setFilterAction }) => {
  const [genreSelectOpen, setGenreSelectOpen] = useState(false);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: genres } = useErrorHandledQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
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
            <SelectValue placeholder={<span className="text-muted-foreground">Kategoria</span>} />
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

const MyBooksStatusFilter: FC<FilterComponentProps> = ({ filter, initialValue, onRemoveFilter, setFilterAction }) => {
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
            <SelectValue placeholder={<span className="text-muted-foreground">Status</span>} />
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

  const [filters, setFilters] = useState<z.infer<typeof myBooksSearchParamsSchema>>({
    genre: search.genre,
    language: search.language,
    releaseYearAfter: search.releaseYearAfter,
    status: search.status,
    authorId: search.authorId,
    isFavorite: search.isFavorite,
  });

  const language = useSelector(myBooksStateSelectors.getLanguage);

  const releaseYearAfter = useSelector(myBooksStateSelectors.getReleaseYearAfter);

  const onClearAll = () => {
    dispatch(setLanguage(''));

    dispatch(setReleaseYearAfter(undefined));

    dispatch(setReleaseYearBefore(undefined));

    dispatch(setGenreId(''));

    dispatch(setStatus(''));

    setFilters({});

    navigate({
      to: '',
      search: ({ title, sort }) => ({ title, sort }),
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
      search: {
        ...filters,
        sort: search.sort,
      },
    });
  };

  const onClearFilter = useCallback(
    (filterKey: keyof typeof filters) => {
      setFilters({
        ...filters,
        [filterKey]: undefined,
      });
    },
    [filters],
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
      <YearRangeFilter
        filter={{
          id: 'year-range-filter',
          key: 'yearRangeFilter',
          type: 'text',
          label: 'Wydana między',
        }}
        onRemoveFilter={() => {
          setFilters({
            ...filters,
            releaseYearBefore: undefined,
            releaseYearAfter: undefined,
          });
        }}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            releaseYearAfter: val[0],
            releaseYearBefore: val[1],
          });
        }}
        initialValue={
          filters.releaseYearAfter ? [filters.releaseYearAfter, filters.releaseYearBefore ?? null] : [null, null]
        }
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

  const sortDateMap = {
    'date-asc': SortingType.asc,
    'date-desc': SortingType.desc,
    '': undefined,
  };

  const {
    genre: genreId,
    language,
    releaseYearAfter,
    releaseYearBefore,
    status,
    title,
    authorId,
    isFavorite,
    sort,
  } = Route.useSearch();

  return (
    <VirtualizedBooksList
      booksQueryArgs={{
        language,
        title,
        releaseYearAfter,
        releaseYearBefore,
        status,
        genreId,
        authorId,
        isFavorite: isFavoriteStateMap[isFavorite ?? ''],
        sortDate: sortDateMap[sort ?? ''],
      }}
    />
  );
};

const BooksPage: FC = () => {
  const isFilterVisible = useSelector(myBooksStateSelectors.getFilterVisibility);

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

const TitleSearchField = () => {
  const search = Route.useSearch();

  const navigate = Route.useNavigate();

  const [searchedName, setSearchedName] = useState<string | undefined>(search.title);

  const debouncedSearchedName = useDebounce(searchedName, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, title: debouncedSearchedName }),
    });
  }, [debouncedSearchedName, navigate]);

  const removeFiler = () => {
    setSearchedName(undefined);

    navigate({
      to: '',
      // Purposeful :)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      search: ({ title, ...rest }) => rest,
    });
  };

  return (
    <div className="relative pl-4 flex flex-col gap-2">
      <Input
        onChange={(e) => {
          setSearchedName(e.target.value);
        }}
        value={searchedName ?? ''}
        className=""
        placeholder="Wyszukaj po tytule..."
      />
      {debouncedSearchedName && (
        <Button
          variant="ghost"
          size="icon"
          className="w-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-transparent p-0 h-auto"
          onClick={removeFiler}
        >
          <X className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

const View: FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
        <div className="w-full px-8 flex justify-between items-center gap-4 pb-4">
          <TitleSearchField />
          <BooksPageTopBar />
        </div>
        <BooksPage />
      </div>
    </AuthenticatedLayout>
  );
};

const myBooksSearchParamsSchema = z
  .object({
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
    releaseYearBefore: z.number().int().min(1900).optional().catch(undefined),
    releaseYearAfter: z.number().int().min(1900).optional().catch(undefined),
    authorId: z.string().uuid().optional().catch(''),
    isFavorite: z.enum(['true', 'false', '']).optional().catch(''),
    sort: z.enum(['date-asc', 'date-desc', '']).optional().catch(''),
  })
  .superRefine((args, ctx) => {
    if (args.releaseYearAfter && args.releaseYearBefore && args.releaseYearAfter > args.releaseYearBefore) {
      ctx.addIssue({
        code: 'custom',
        message: 'Lata wydania są niepoprawne',
        path: ['releaseYearAfter'],
      });
    }
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
