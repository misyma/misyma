import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { type FC, useMemo } from 'react';
import { HiOutlineFilter } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi2';
import { useSelector, useDispatch } from 'react-redux';

import { useFindUserBookshelfsQuery } from '../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BooksSortButton } from '../../../common/components/booksSortButton/booksSortButton';
import { Button } from '../../../common/components/button/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import {
  myBooksStateSelectors,
  setFilterVisible,
} from '../../../core/store/states/myBooksFilterState/myBooksFilterStateSlice';
import { BookNavigationFromEnum } from '../../constants';

export const BooksPageTopBar: FC = () => {
  return (
    <div className="flex items-center gap-4">
      <CreateBookButton />
      <BooksFiltersVisibilityButton />
      <BooksSortButton navigationPath="/mybooks" />
    </div>
  );
};

const CreateBookButton = () => {
  const navigate = useNavigate();

  const { data: bookshelvesData, isLoading } = useFindUserBookshelfsQuery({});

  const router = useRouter();

  const from = router.latestLocation.href.includes('/mybooks')
    ? BookNavigationFromEnum.books
    : BookNavigationFromEnum.shelves;

  const url = from === BookNavigationFromEnum.shelves ? '/shelves/bookshelf/search' : '/mybooks/search';

  const usableBookshelves = bookshelvesData?.data.filter((b) => !['Wypożyczalnia', 'Archiwum'].includes(b.name));

  const cannotCreateBook = isLoading || usableBookshelves?.length === 0;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="big-icon"
            className="!cursor-default disabled:!pointer-events-auto"
            disabled={cannotCreateBook}
            onClick={() => {
              if (cannotCreateBook) {
                return;
              }
              navigate({
                to: url,
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
          {!cannotCreateBook && <p>Stwórz książkę</p>}
          {cannotCreateBook && <p>Stwórz półkę aby stworzyć książkę</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const BooksFiltersVisibilityButton = () => {
  const isFilterVisible = useSelector(myBooksStateSelectors.getFilterVisibility);

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
