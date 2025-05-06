import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState, type FC } from 'react';

import { FilterContainer } from './filterContainer';
import { FindUserBookByIdQueryOptions } from '../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { BookSearchSelector } from '../../../book/components/molecules/bookSearchSelector/bookSearchSelector';
import { cn } from '../../lib/utils';
import { type FilterComponentProps } from '../../types/filter';
import { Button } from '../button/button';
import { Popover, PopoverTrigger } from '../popover/popover';
import { LoadingSpinner } from '../spinner/loading-spinner';
import { useErrorHandledQuery } from '../../hooks/useErrorHandledQuery';

export const BookSearchFilter: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  setFilterAction,
  onRemoveFilter,
}) => {
  const [selectedBookName, setSelectedBookName] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(initialValue ?? '');

  const onRemoveFilterInternal = () => {
    if (onRemoveFilter) {
      onRemoveFilter();
    }

    setSelectedBookName('');
    setSelectedBookId('');
  };

  useEffect(() => {
    if (!initialValue && selectedBookName) {
      setSelectedBookName('');
    }
  }, [initialValue, selectedBookName]);

  const onChange = (bookId: string, bookName: string) => {
    setFilterAction(bookId);
    setSelectedBookId(bookId);
    setSelectedBookName(bookName);
  };

  const { data: userBook, isFetching: isFetchingCurrentBook } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: selectedBookId,
    }),
  );

  const displayedBookName = useMemo(() => {
    if (userBook?.book.title) {
      return userBook?.book.title;
    }
    return selectedBookName;
  }, [userBook, selectedBookName]);

  return (
    <FilterContainer
      filter={filter}
      hasValue={!!selectedBookId}
      onRemoveFilter={onRemoveFilter ? onRemoveFilterInternal : undefined}
      slot={
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              role="combobox"
              size="custom"
              className={cn(
                'justify-between bg-[#D1D5DB]/20',
                !initialValue && 'text-muted-foreground',
                'border h-12',
                'w-full sm:w-full truncate',
              )}
            >
              <div className="flex-1 min-w-0 max-w-full">
                {' '}
                <div className="flex items-center w-full overflow-hidden">
                  {!initialValue && <span className="px-3 text-muted-foreground text-sm">Wyszukaj książkę</span>}
                  {initialValue && isFetchingCurrentBook && !selectedBookName && (
                    <div className="px-2">
                      <LoadingSpinner size={20} />
                    </div>
                  )}
                  {initialValue && (!isFetchingCurrentBook || selectedBookName) && (
                    <span className="block truncate px-3 text-sm font-normal text-foreground">{displayedBookName}</span>
                  )}
                </div>
              </div>{' '}
              <div className="pr-3">
                <ChevronDown className="h-8 w-8 text-primary" />
              </div>
            </Button>
          </PopoverTrigger>

          <BookSearchSelector onSelect={onChange} />
        </Popover>
      }
    ></FilterContainer>
  );
};
