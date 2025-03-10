import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, type FC } from 'react';

import { type FindQuotesQueryParams } from '@common/contracts';

import { FavoriteQuotationButton } from '../../../book/components/favoriteQuotationButton/favoriteQuotationButton';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { getQuotesByInfiniteQueryOptions } from '../../api/queries/getQuotes/getQuotes';
import { Blockquote } from '../blockQuote/blockQuote';
import { DeleteQuoteModal } from '../deleteQuoteModal/deleteQuoteModal';
import { UpdateQuoteButton } from '../updateQuoteModal/updateQuoteModal';

interface VirtualizedQuotesListProps {
  className?: string;
  queryArgs?: Omit<FindQuotesQueryParams, 'accessToken'>;
}

export const VirtualizedQuotesList: FC<VirtualizedQuotesListProps> = ({ queryArgs }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
    getQuotesByInfiniteQueryOptions({
      pageSize: 6,
      ...queryArgs,
    }),
  );

  const allQuotes = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data]);

  const rowsCount = hasNextPage ? allQuotes.length + 1 : allQuotes.length;

  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 4 : rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Adjusted for card height
    overscan: 6,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (lastItem?.index >= allQuotes.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowVirtualizer.getVirtualItems(), hasNextPage, fetchNextPage, isFetchingNextPage, allQuotes.length]);

  if (!isLoading && !allQuotes.length) {
    return <div className="w-full text-center py-8 text-gray-500">Nie znaleziono półek</div>;
  }

  return (
    <div
      ref={parentRef}
      // for mobile: calculating screen height and dynamically assigning via {style}
      className="w-full max-w-screen-2xl h-[650px] sm:h-[800px] overflow-auto no-scrollbar px-2 py-8"
    >
      <div
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= allQuotes.length;
          const startIndex = virtualRow.index;
          const quote = allQuotes[startIndex];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: `${virtualRow.size}px`,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div className="gap-4">
                  <Skeleton
                    className="h-80"
                    style={{
                      position: 'absolute',
                    }}
                  />
                </div>
              ) : (
                <div className="gap-4">
                  {quote && (
                    <Blockquote
                      key={quote.id + quote.content}
                      page={quote.page}
                      date="2025-01-01"
                      title={quote.bookTitle}
                      className="h-[180px]"
                      author={quote.authors?.join(', ')}
                      rightButtons={
                        <>
                          <UpdateQuoteButton
                            key={quote.id}
                            quote={quote}
                          />
                          <DeleteQuoteModal
                            userBookId={quote.userBookId}
                            quoteId={quote.id as string}
                          />
                          <FavoriteQuotationButton quote={quote} />
                        </>
                      }
                    >
                      {quote.content}
                    </Blockquote>
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
