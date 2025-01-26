import { useNavigate } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FC, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserBookshelfsInfiniteQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BookshelfCard } from '../bookshelfCard/bookshelfCard';

interface VirtualizedBookshelvesListProps {
  name?: string;
}

export const VirtualizedBookshelvesList: FC<VirtualizedBookshelvesListProps> = () => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useFindUserBookshelfsInfiniteQuery({
    accessToken,
    pageSize: 1,
  });

  const allBookshelves = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data]);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allBookshelves.length + 1 : allBookshelves.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 340, // Adjusted for card height
    overscan: 3,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (lastItem?.index >= allBookshelves.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowVirtualizer.getVirtualItems(), hasNextPage, fetchNextPage, isFetchingNextPage, allBookshelves.length]);

  if (!isLoading && !allBookshelves.length) {
    return <div className="w-full text-center py-8 text-gray-500">No bookshelves found</div>;
  }

  return (
    <div
      ref={parentRef}
      className="w-full h-[800px] overflow-auto no-scrollbar px-2"
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= allBookshelves.length;
          const bookshelf = allBookshelves[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div className="animate-pulse rounded-[20px] border shadow-sm shadow-gray-400 h-full bg-gray-100" />
              ) : (
                <BookshelfCard
                  bookshelf={bookshelf}
                  onClick={() => navigate({ to: `/shelves/bookshelf/${bookshelf.id}` })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
