import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FC, useEffect, useMemo, useRef } from 'react';

import { type FindUserBooksQueryParams } from '@common/contracts';

import { cn } from '../../../../common/lib/utils';
import { FindUserBooksByInfiniteQueryOptions } from '../../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { BookCardRow } from '../../molecules/bookCardRow/bookCardRow';
import { BookCardRowSkeleton } from '../../molecules/bookCardRow/bookCardRowSkeleton';

interface VirtualizedBooksListProps {
  className?: string;
  bookshelfId?: string;
  borrowedBooks?: boolean;
  filtersToInclude?: Record<string, boolean>;
  booksQueryArgs?: FindUserBooksQueryParams;
}
export const VirtualizedBooksList: FC<VirtualizedBooksListProps> = ({
  className,
  bookshelfId,
  borrowedBooks = false,
  booksQueryArgs,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
    FindUserBooksByInfiniteQueryOptions({
      bookshelfId,
      pageSize: 18,
      ...booksQueryArgs,
    }),
  );

  const allBooks = data ? data.pages.flatMap((d) => d.data) : [];

  const allBookChunks = Array.from({ length: Math.ceil(allBooks.length / 6) }, (_, i) =>
    allBooks.slice(i * 6, i * 6 + 6),
  );

  const rowsCount = useMemo(() => {
    if (hasNextPage) {
      const lastPage = data?.pages[data.pages.length - 1];

      const pageSize = lastPage?.metadata.pageSize;

      const totalItems = lastPage?.metadata.total;

      return totalItems && pageSize ? Math.ceil(totalItems / (pageSize / 3)) : allBookChunks.length + 1;
    }

    if (allBookChunks.length > 0) {
      return allBookChunks.length;
    } else if (allBookChunks.length === 0 && !hasNextPage && !isLoading) {
      return 0;
    }

    return 3;
  }, [hasNextPage, isLoading, data?.pages, allBookChunks.length]);

  const rowVirtualizer = useVirtualizer({
    count: rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 356,
    overscan: 1,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= allBookChunks.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasNextPage,
    fetchNextPage,
    allBookChunks.length,
    isFetchingNextPage,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div
      className={cn('w-full px-2 h-[800px] 4xl:h-[1068px] overflow-auto no-scrollbar', className)}
      ref={parentRef}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {allBooks.length > 0 || isLoading ? (
          rowVirtualizer.getVirtualItems().map((virtualRow, idx) => {
            const isLoaderRow = virtualRow.index >= allBookChunks.length;

            const booksChunk = isLoaderRow ? undefined : allBookChunks[virtualRow.index];

            const isFirstLoaderAttempt = isLoading && isLoaderRow;

            const isSubsequentLoader = !isLoading && isLoaderRow && hasNextPage;

            const page = Math.ceil(idx / 3) > 0 ? Math.ceil(idx / 3) : 1;

            return (
              <div
                key={virtualRow.index}
                style={{
                  height: `${virtualRow.size}px`,
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {(isFirstLoaderAttempt || isSubsequentLoader) && <BookCardRowSkeleton />}
                {!isSubsequentLoader && booksChunk && (
                  <BookCardRow
                    pageNumber={page}
                    borrowedBooks={borrowedBooks}
                    books={booksChunk}
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="w-full text-center py-8">Brak wyników</div>
        )}
      </div>
    </div>
  );
};
