import { Navigate, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { type FC, useEffect, useMemo, useState } from 'react';
import { HiOutlineFilter } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import {
  FindUserBooksSortField,
  Language,
  ReadingStatus,
  SortOrder,
  type FindBookshelfResponseBody,
} from '@common/contracts';

import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { useFindBookshelfByIdQuery } from '../../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { VirtualizedBooksList } from '../../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList';
import { BooksSortButton } from '../../../modules/common/components/booksSortButton/booksSortButton';
import { Button } from '../../../modules/common/components/button/button';
import { AuthorSearchFilter } from '../../../modules/common/components/filter/AuthorSearchFilter';
import {
  CheckboxFilter,
  GenreSelectFilter,
  MyBooksStatusFilter,
  YearRangeFilter,
} from '../../../modules/common/components/filter/filter';
import FiltersDrawer from '../../../modules/common/components/filtersDrawer/filtersDrawer';
import { Input } from '../../../modules/common/components/input/input';
import { SearchLanguageSelect } from '../../../modules/common/components/searchLanguageSelect/SearchLanguageSelect';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../modules/common/components/tooltip/tooltip';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../../modules/common/contexts/breadcrumbKeysContext';
import useDebounce from '../../../modules/common/hooks/useDebounce';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';
import {
  bookshelfBooksFilterStateSelectors,
  setFilterVisible,
} from '../../../modules/core/store/states/bookshelfBooksFilterState/bookshelfBooksFilterStateSlice';

export const View: FC = () => {
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  const breadcrumbKeys = useBreadcrumbKeysContext();

  const dispatch = useBreadcrumbKeysDispatch();

  useEffect(() => {
    if (bookshelfResponse?.name) {
      dispatch({
        key: '$bookshelfName',
        value: bookshelfResponse?.name,
      });

      dispatch({
        key: '$bookshelfId',
        value: bookshelfResponse.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfResponse]);

  useEffect(() => {
    if (breadcrumbKeys['$bookName']) {
      dispatch({
        key: '$bookName',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bookshelfResponse?.name === 'Wypożyczalnia') {
    return <BorrowingBookshelf></BorrowingBookshelf>;
  }

  return <Bookshelf></Bookshelf>;
};

interface BookshelfTopBarProps {
  bookshelfResponse: FindBookshelfResponseBody | undefined;
  bookshelfId: string;
}

const SearchButtonInput = () => {
  const { title } = Route.useSearch();
  const [value, setValue] = useState(title);

  const navigate = useNavigate();

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: {
        title: debouncedValue,
      },
    });
  }, [debouncedValue, navigate]);

  return (
    <Input
      containerClassName="p-0 h-10"
      iSize="lg"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full h-10"
    />
  );
};

const BookshelfTopBar: FC<BookshelfTopBarProps> = ({ bookshelfResponse, bookshelfId }) => {
  const navigate = useNavigate();

  const isArchiveOrBorrowingBookshelf =
    bookshelfResponse?.name === 'Archiwum' || bookshelfResponse?.name === 'Wypożyczalnia';

  return (
    <div className="mt-10 flex justify-between w-full sm:max-w-7xl pb-4">
      <div>
        <p className="text-xl min-h-[1.75rem] sm:min-h-[2.25rem] max-w-[40rem] truncate sm:text-3xl">
          {bookshelfResponse?.name ?? ' '}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <SearchButtonInput />
        <BooksFiltersVisibilityButton />
        <BooksSortButton navigationPath={`/shelves/bookshelf/${bookshelfId}`} />
        {(!isArchiveOrBorrowingBookshelf || !bookshelfResponse) && (
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
                        bookshelfId,
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
        )}
      </div>
    </div>
  );
};

const BooksFiltersVisibilityButton = () => {
  const isFilterVisible = useSelector(bookshelfBooksFilterStateSelectors.getFilterVisibility);

  const dispatch = useDispatch();

  const search = useSearch({ strict: false });

  const filtersApplied = useMemo(() => {
    return (
      Object.entries(search)
        .filter(([key]) => !['page', 'pageSize', 'sortField', 'sortOrder'].includes(key))
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

const BookshelfBooksPageFiltersBar = () => {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const isFilterVisible = useSelector(bookshelfBooksFilterStateSelectors.getFilterVisibility);

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
      open={isFilterVisible}
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
            releaseYearAfter: after ?? undefined,
            releaseYearBefore: before ?? undefined,
          })
        }
        initialValue={
          search.releaseYearAfter ? [search.releaseYearAfter, search.releaseYearBefore ?? null] : [null, null]
        }
      />
      <CheckboxFilter
        initialValue={search.isFavorite === '' ? false : search.isFavorite}
        onRemoveFilter={() => updateSearch({ isFavorite: undefined })}
        setFilterAction={(val) => updateSearch({ isFavorite: val })}
        filter={{
          id: 'is-favorite-filter',
          key: 'isFavorite',
          label: 'Ulubiona',
          type: 'three-state-checkbox',
        }}
      />
    </FiltersDrawer>
  );
};

const BookshelfBooksVirtualizedBooksList = ({
  bookshelfId,
  borrowedBooks,
}: {
  bookshelfId: string;
  borrowedBooks?: boolean;
}) => {
  const sortFieldMap = {
    createdAt: FindUserBooksSortField.createdAt,
    releaseYear: FindUserBooksSortField.releaseYear,
    rating: FindUserBooksSortField.rating,
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
      bookshelfId={bookshelfId}
      borrowedBooks={borrowedBooks}
      className="h-[700px]"
      booksQueryArgs={{
        language,
        title,
        releaseYearAfter,
        releaseYearBefore,
        status,
        genreId,
        authorId,
        isFavorite: isFavorite !== '' ? (isFavorite ?? undefined) : undefined,
        sortField: sortFieldMap[sortField ?? ''],
        sortOrder: sortOrderMap[sortOrder ?? ''],
      }}
    />
  );
};

export const BorrowingBookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  return (
    <AuthenticatedLayout>
      <div className="px-8 flex flex-col justify-center w-full items-center">
        <BookshelfTopBar
          bookshelfId={bookshelfId}
          bookshelfResponse={bookshelfResponse}
        />
        <div className="flex flex-col justify-center gap-8 pt-8 w-full sm:max-w-7xl">
          <BookshelfBooksPageFiltersBar />
          <BookshelfBooksVirtualizedBooksList
            bookshelfId={bookshelfId}
            borrowedBooks={true}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Bookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  return (
    <AuthenticatedLayout>
      <div className="px-8 flex flex-col justify-center w-full items-center">
        <BookshelfTopBar
          bookshelfId={bookshelfId}
          bookshelfResponse={bookshelfResponse}
        />
        <div
          key={bookshelfId}
          className="flex flex-col justify-center pt-2 w-full sm:max-w-7xl"
        >
          <BookshelfBooksPageFiltersBar />
          <BookshelfBooksVirtualizedBooksList bookshelfId={bookshelfId} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const bookshelfBooksPathParamsSchema = z.object({
  bookshelfId: z.string().uuid().catch(''),
});

const bookshelfBooksSearchParamsSchema = z
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
    isFavorite: z.boolean().or(z.literal('')).optional().catch(''),
    sortField: z.enum(['createdAt', 'releaseYear', 'rating', '']).optional().catch(''),
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

export const Route = createFileRoute('/shelves/bookshelf/$bookshelfId')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  parseParams: bookshelfBooksPathParamsSchema.parse,
  validateSearch: bookshelfBooksSearchParamsSchema,
  onError: () => {
    return <Navigate to={'/mybooks'} />;
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
      {
        readableName: '$bookshelfName',
        href: `/shelves/bookshelf/$bookshelfId`,
      },
    ],
  },
});
