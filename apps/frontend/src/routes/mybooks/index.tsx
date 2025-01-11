import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { FindUserBooksSortField, Language, ReadingStatus, SortOrder } from '@common/contracts';

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
import { myBooksStateSelectors } from '../../modules/core/store/states/myBooksFilterState/myBooksFilterStateSlice.js';
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
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      to: '',
      search: (current) => ({
        ...current,
        ...updates,
      }),
    });
  };

  const onClearAll = () => {
    navigate({
      to: '',
      search: ({ title, sortField, sortOrder }) => ({
        title,
        sortField,
        sortOrder,
      }),
    });
  };

  const hasAnyFilter = useMemo(() => Object.values(search).filter((val) => val !== undefined).length > 0, [search]);

  return (
    <FiltersDrawer
      omitApplyButton
      showClearButton={hasAnyFilter}
      className="grid grid-cols-3"
      onClearAll={onClearAll}
      onApplyFilters={() => {}}
    >
      <AuthorSearchFilter
        setFilterAction={(val) => updateSearch({ authorId: val })}
        onRemoveFilter={() => updateSearch({ authorId: undefined })}
        initialValue={search.authorId}
        filter={{
          id: 'author-ids-filter',
          key: 'authorIds',
          label: 'Autor',
          type: 'text',
        }}
      />
      <SearchLanguageSelect
        key={search.language}
        onRemoveFilter={() => updateSearch({ language: undefined })}
        initialValue={search.language}
        setFilterAction={(val) => updateSearch({ language: val })}
        filter={{
          id: 'language-filter',
          key: 'language',
          label: 'Język',
          type: 'text',
        }}
      />
      <GenreSelectFilter
        initialValue={search.genre}
        onRemoveFilter={() => updateSearch({ genre: undefined })}
        setFilterAction={(val) => updateSearch({ genre: val })}
        filter={{
          id: 'category-filter',
          key: 'categoryFilter',
          label: 'Kategoria',
          type: 'text',
        }}
      />
      <MyBooksStatusFilter
        initialValue={search.status}
        onRemoveFilter={() => updateSearch({ status: undefined })}
        setFilterAction={(val) => updateSearch({ status: val })}
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
        onRemoveFilter={() =>
          updateSearch({
            releaseYearBefore: undefined,
            releaseYearAfter: undefined,
          })
        }
        setFilterAction={([after, before]) =>
          updateSearch({
            releaseYearAfter: after,
            releaseYearBefore: before,
          })
        }
        initialValue={
          search.releaseYearAfter ? [search.releaseYearAfter, search.releaseYearBefore ?? null] : [null, null]
        }
      />
      <ThreeStateCheckboxFilter
        initialValue={search.isFavorite}
        onRemoveFilter={() => updateSearch({ isFavorite: undefined })}
        setFilterAction={(val) => updateSearch({ isFavorite: val })}
        filter={{
          id: 'is-favorite-filter',
          key: 'isFavorite',
          label: 'Ulubiona',
          type: 'three-state-checkbox',
          initialValue: search.isFavorite,
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

  const sortFieldMap = {
    createdAt: FindUserBooksSortField.createdAt,
    releaseYear: FindUserBooksSortField.releaseYear,
    '': undefined,
  };

  const sortOrderMap = {
    asc: SortOrder.asc,
    desc: SortOrder.desc,
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
    sortField,
    sortOrder,
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
        sortField: sortFieldMap[sortField ?? ''],
        sortOrder: sortOrderMap[sortOrder ?? ''],
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
    sortField: z.enum(['createdAt', 'releaseYear', '']).optional().catch(''),
    sortOrder: z.enum(['asc', 'desc', '']).optional().catch(''),
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
