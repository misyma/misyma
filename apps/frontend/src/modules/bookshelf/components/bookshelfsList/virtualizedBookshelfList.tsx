import { useNavigate, useSearch } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useFindUserBookshelfsInfiniteQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BookshelfCard } from '../bookshelfCard/bookshelfCard';

interface VirtualizedBookshelvesListProps {
  route: '/shelves/';
}

export const VirtualizedBookshelvesList: FC<VirtualizedBookshelvesListProps> = ({ route }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Something's wrong with those and it does not pick up the schema correctly
  const searchParams = useSearch({
    strict: true,
    from: route,
  }) as { name?: string };

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useFindUserBookshelfsInfiniteQuery({
    pageSize: 2,
    name: searchParams?.name,
  });

  const allBookshelves = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data]);

  const rowsCount = hasNextPage ? allBookshelves.length + 1 : allBookshelves.length;

  const [virtualizerLanes, setVirtualizerLanes] = useState(2);

  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 4 : rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 340, // Adjusted for card height
    overscan: 6,
    lanes: virtualizerLanes,
  });

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      if (parent.offsetWidth < 1000) {
        setVirtualizerLanes(1);
      } else {
        setVirtualizerLanes(2);
      }
      rowVirtualizer.measure();
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [parentRef, rowVirtualizer]);

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (lastItem?.index >= Math.ceil(allBookshelves.length / 2) - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowVirtualizer.getVirtualItems(), hasNextPage, fetchNextPage, isFetchingNextPage, allBookshelves.length]);

  if (!isLoading && !allBookshelves.length) {
    return <div className="w-full text-center py-8 text-gray-500">Nie znaleziono półek</div>;
  }

  return (
    <div
      ref={parentRef}
      // for mobile: calculating screen height and dynamically assigning via {style}
      className="w-full max-w-screen-2xl h-[650px] sm:h-[900px] overflow-auto no-scrollbar px-2"
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const laneIndex = virtualRow.index % virtualizerLanes;
          const columnWidth = (parentRef.current?.offsetWidth ?? 0) / virtualizerLanes;
          const isLoaderRow = virtualRow.index >= Math.ceil(allBookshelves.length);
          const startIndex = virtualRow.index;
          const bookshelf1 = allBookshelves[startIndex];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${columnWidth}`,
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div className="gap-4">
                  <Skeleton
                    className="h-80"
                    style={{
                      position: 'absolute',
                      width: `${columnWidth - 10}px`,
                      left: `${laneIndex * columnWidth}px`,
                    }}
                  />
                </div>
              ) : (
                <div className="gap-4">
                  {bookshelf1 && (
                    <BookshelfCard
                      style={{
                        position: 'absolute',
                        left: `${laneIndex * columnWidth}px`,
                        width: `${columnWidth - 10}px`,
                      }}
                      bookshelf={bookshelf1}
                      onClick={() => navigate({ to: `/shelves/bookshelf/${bookshelf1.id}` })}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
