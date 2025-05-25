import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo, type FC } from 'react';
import { HiOutlineFilter } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';

import { type FindBookshelfResponseBody } from '@common/contracts';

import { BooksSortButton } from '../../../../common/components/booksSortButton/booksSortButton';
import { Button } from '../../../../common/components/button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import {
  bookshelfBooksFilterStateSelectors,
  setFilterVisible,
} from '../../../../core/store/states/bookshelfBooksFilterState/bookshelfBooksFilterStateSlice';
import { BookshelfSearchButtonInput } from '../../atoms/bookshelfSearchBookInput/bookshelfSearchBookInput';

const BooksFiltersVisibilityButton = () => {
  const isFilterVisible = useSelector(bookshelfBooksFilterStateSelectors.getFilterVisibility);

  const dispatch = useDispatch();

  const search = useSearch({
    from: '/shelves/bookshelf/$bookshelfId',
  });

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

interface BookshelfTopBarProps {
  bookshelfResponse: FindBookshelfResponseBody | undefined;
  bookshelfId: string;
}

export const BookshelfTopBar: FC<BookshelfTopBarProps> = ({ bookshelfResponse, bookshelfId }) => {
  const navigate = useNavigate();

  const isArchiveOrBorrowingBookshelf =
    bookshelfResponse?.name === 'Archiwum' || bookshelfResponse?.name === 'Wypożyczalnia';

  return (
    <div className="mt-4 flex justify-between w-full sm:max-w-7xl pb-4">
      <div>
        <p className="text-xl min-h-[1.75rem] sm:min-h-[2.25rem] max-w-[40rem] truncate sm:text-3xl">
          {bookshelfResponse?.name ?? ' '}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <BookshelfSearchButtonInput />

        {(!isArchiveOrBorrowingBookshelf || !bookshelfResponse) && (
          <Button
            size="lg"
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
            Dodaj książkę
          </Button>
        )}
        <BooksFiltersVisibilityButton />
        <BooksSortButton navigationPath={`/shelves/bookshelf/${bookshelfId}`} />
      </div>
    </div>
  );
};
