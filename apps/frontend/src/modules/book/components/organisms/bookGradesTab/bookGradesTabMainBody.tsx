import { useQueryClient } from '@tanstack/react-query';
import { type FC, useMemo, useState } from 'react';

import { sortOrders } from '@common/contracts';

import { BookReadingsApiQueryKeys } from '../../../../bookReadings/api/queries/bookReadingsApiQueryKeys';
import { FindBookReadingsQueryOptions } from '../../../../bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';
import { bookReadingsTableColumns } from '../../../../bookReadings/components/organisms/bookReadingsTable/bookReadingsTableColumns';
import { DataTable } from '../../../../common/components/dataTable/dataTable';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { BookTitle } from '../../../../quotes/components/atoms/bookTitle/bookTitle';
import { useFindUserQuery } from '../../../../user/api/queries/findUserQuery/findUserQuery';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { CurrentRatingStar } from '../../atoms/currentRatingStar/currentRatingStar';
import { BookPageContentCard } from '../../atoms/bookPageContentCard/bookPageContentCard';
import { ScrollArea } from '../../../../common/components/scrollArea/scroll-area';

interface BookGradesTabMainBodyProps {
  bookId: string;
}
export const BookGradesTabMainBody: FC<BookGradesTabMainBodyProps> = ({ bookId }) => {
  const [pageSize] = useState(4);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const { data: bookReadings } = useErrorHandledQuery(
    FindBookReadingsQueryOptions({
      userBookId: bookId,
      page,
      pageSize,
      sortDate: sortOrders.desc,
    }),
  );

  const { data: userBookData, isLoading } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const invalidateReadingsFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === BookReadingsApiQueryKeys.findBookReadings &&
        query.queryKey[1] === userData?.id &&
        query.queryKey[2] === bookId,
    });

  const onSetPage = (page: number): void => {
    setPage(page);

    invalidateReadingsFetch();
  };

  const pageCount = useMemo(() => {
    return Math.ceil((bookReadings?.metadata?.total ?? 0) / pageSize) || 1;
  }, [bookReadings?.metadata.total, pageSize]);

  return (
      <BookPageContentCard>
        <div className="flex flex-col gap-6">
          <div className="flex flex-shrink-0 justify-between items-center">
            {!isLoading ? <BookTitle title={userBookData?.book.title ?? ''} /> : <Skeleton className="h-9 w-40" />}
            <CurrentRatingStar userBookId={bookId} />
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
            {isLoading && (
              <div className="pb-6">
                <Skeleton className="h-7 w-40" />
              </div>
            )}
            <ScrollArea className='max-h-[22rem] w-full'>
              <DataTable
                tableContainerClassName="min-h-[unset] pr-2"
                hideHeaders={true}
                columns={bookReadingsTableColumns}
                data={bookReadings?.data ?? []}
                onSetPage={onSetPage}
                pageCount={pageCount}
                pageIndex={page}
                pageSize={pageSize}
                itemsCount={bookReadings?.metadata.total}
                PaginationSlot={pageCount <= 1 ? <></> : null}
              />
            </ScrollArea>
          </div>
        </div>
      </BookPageContentCard>
  );
};
