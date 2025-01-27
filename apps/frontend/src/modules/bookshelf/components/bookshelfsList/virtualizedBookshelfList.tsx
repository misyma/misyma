import { useNavigate, useSearch } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FC, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserBookshelfsInfiniteQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BookshelfCard } from '../bookshelfCard/bookshelfCard';

interface VirtualizedBookshelvesListProps {
  route: '/shelves/';
}

export const VirtualizedBookshelvesList: FC<VirtualizedBookshelvesListProps> = ({ route }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Something's wrong with those and it does not pick up the schema correctly
  const searchParams = useSearch({
    strict: true,
    from: route,
  }) as { name?: string };

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useFindUserBookshelfsInfiniteQuery({
    accessToken,
    pageSize: 2,
    name: searchParams?.name,
  });

  const allBookshelves = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data]);

  const rowsCount = hasNextPage ? Math.ceil(allBookshelves.length / 2) + 1 : Math.ceil(allBookshelves.length / 2);

  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 4 : rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 340, // Adjusted for card height
    overscan: 3,
  });

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
      className="w-full h-[725px] overflow-auto no-scrollbar px-2"
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= Math.ceil(allBookshelves.length / 2);
          const startIndex = virtualRow.index * 2;
          const bookshelf1 = allBookshelves[startIndex];
          const bookshelf2 = allBookshelves[startIndex + 1];

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookshelf1 && (
                    <BookshelfCard
                      bookshelf={bookshelf1}
                      onClick={() => navigate({ to: `/shelves/bookshelf/${bookshelf1.id}` })}
                    />
                  )}
                  {bookshelf2 && (
                    <BookshelfCard
                      bookshelf={bookshelf2}
                      onClick={() => navigate({ to: `/shelves/bookshelf/${bookshelf2.id}` })}
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
