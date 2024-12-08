import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FC, useEffect, useMemo, useRef } from 'react';
import { FindUserBooksByInfiniteQueryOptions } from '../../../book/api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useSelector } from 'react-redux';
import { BookCardRow } from '../bookCardRow/bookCardRow';
import { BookCardRowSkeleton } from '../bookCardRow/bookCardRowSkeleton';

interface VirtualizedBooksListProps {}
export const VirtualizedBooksList: FC<VirtualizedBooksListProps> = () => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const parentRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(
      FindUserBooksByInfiniteQueryOptions({
        accessToken,
        pageSize: 18,
      })
    );

  const allBooks = data ? data.pages.flatMap((d) => d.data) : [];

  const allBookChunks = Array.from(
    { length: Math.ceil(allBooks.length / 6) },
    (_, i) => allBooks.slice(i * 6, i * 6 + 6)
  );

  const rowsCount = useMemo(() => {
    if (hasNextPage) {
      const lastPage = data?.pages[data.pages.length - 1];
      const pageSize = lastPage?.metadata.pageSize;
      const totalItems = lastPage?.metadata.total;

      return totalItems && pageSize
        ? Math.ceil(totalItems / (pageSize / 3))
        : allBookChunks.length + 1;
    }

    if (allBookChunks.length > 0) {
      return allBookChunks.length;
    }

    return 3;
  }, [hasNextPage, data?.pages, allBookChunks.length]);

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

    if (
      lastItem.index >= allBookChunks.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
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
      className="w-full px-2 h-[800px] 4xl:h-[1068px] overflow-auto"
      ref={parentRef}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= allBookChunks.length;
          const booksChunk = isLoaderRow
            ? undefined
            : allBookChunks[virtualRow.index];

          const isFirstLoaderAttempt = isLoading && isLoaderRow;
          const isSubsequentLoader = !isLoading && isLoaderRow && hasNextPage;

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
              {isFirstLoaderAttempt && <BookCardRowSkeleton />}
              {isSubsequentLoader && <BookCardRowSkeleton />}
              {!isSubsequentLoader && booksChunk && (
                <BookCardRow books={booksChunk} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
