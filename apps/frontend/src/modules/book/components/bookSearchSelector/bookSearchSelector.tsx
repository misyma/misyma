import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FC, Fragment, useEffect, useMemo, useRef, useState } from 'react';

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../common/components/command/command';
import { DialogPopoverContent, PopoverContent } from '../../../common/components/popover/popover';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import useDebounce from '../../../common/hooks/useDebounce';
import { cn } from '../../../common/lib/utils';
import { FindUserBooksByInfiniteQueryOptions } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';

interface BookSearchSelectorProps {
  onSelect: (bookId: string, bookTitle: string) => void;
  className?: string;
  currentlySelectedBookId?: string;
  searchedName?: string;
  dialog?: boolean;
}

export const BookSearchSelector: FC<BookSearchSelectorProps> = ({
  className,
  //   currentlySelectedBookId,
  searchedName: propSearchedName,
  dialog = false,
  onSelect,
}) => {
  const [searchedTitle, setSearchedTitle] = useState<string | undefined>(propSearchedName);

  const debouncedSearchTitle = useDebounce(searchedTitle, 300);

  const render = () => (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Wyszukaj książkę..."
        onValueChange={setSearchedTitle}
      />
      <CommandList>
        <BookCommandGroup
          onSelect={onSelect}
          searchedTitle={debouncedSearchTitle}
        />
      </CommandList>
    </Command>
  );

  return (
    <Fragment>
      {!dialog && <PopoverContent className={cn('w-60 sm:w-96 p-0', className)}>{render()}</PopoverContent>}
      {dialog && <DialogPopoverContent className={cn('w-60 sm:w-96 p-0', className)}>{render()}</DialogPopoverContent>}
    </Fragment>
  );
};

const BookCommandGroup = ({
  searchedTitle,
  onSelect,
}: {
  onSelect: (bookId: string, bookName: string) => void;
  searchedTitle?: string;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data: books,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    FindUserBooksByInfiniteQueryOptions({
      title: searchedTitle,
    }),
  );

  const options = useMemo(() => {
    return (
      books?.pages.flatMap((p) =>
        p.data.map((a) => ({
          label: a.book.title,
          value: a.id,
        })),
      ) ?? []
    );
  }, [books?.pages]);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? options.length + 1 : options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Adjusted for card height
    overscan: 2,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= options.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // oh shush
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, fetchNextPage, options.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

  useEffect(() => {
    rowVirtualizer.scrollToIndex(0, { align: 'start' });
  }, [rowVirtualizer]);

  return (
    <Fragment>
      {isLoading && (
        <div className="w-full py-4 flex items-center justify-center">
          <LoadingSpinner size={36} />
        </div>
      )}
      {!isLoading && options.length === 0 && (
        <CommandEmpty>
          <p>Nie znaleziono książki</p>
        </CommandEmpty>
      )}
      {!isLoading && options.length > 0 && (
        <div
          ref={parentRef}
          className="h-[300px] overflow-auto"
        >
          <div
            className="w-full"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {!isLoading &&
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                //   const isLoaderRow = virtualRow.index >= options.length;x
                const startIndex = virtualRow.index;
                const book = options[startIndex];

                return (
                  <CommandItem
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: `${virtualRow.size}px`,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onSelect={() => {
                      onSelect(book.value, book.label);
                    }}
                    key={book?.value}
                    className="cursor-pointer"
                  >
                    <span>{book?.label}</span>
                  </CommandItem>
                );
              })}
          </div>
        </div>
      )}
    </Fragment>
  );
};
