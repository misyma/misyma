import { useQueryClient } from '@tanstack/react-query';
import { type FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { SortingType } from '@common/contracts';

import { FindUserBookByIdQueryOptions } from '../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { CurrentRatingStar } from '../../book/components/currentRatingStar/currentRatingStar';
import { BookReadingsApiQueryKeys } from '../../bookReadings/api/queries/bookReadingsApiQueryKeys';
import { FindBookReadingsQueryOptions } from '../../bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';
import { bookReadingsTableColumns } from '../../bookReadings/components/bookReadingsTable/bookReadingsTableColumns';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { Separator } from '../../common/components/separator/separator';
import { Skeleton } from '../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../common/hooks/useErrorHandledQuery';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../user/api/queries/findUserQuery/findUserQuery';

interface BookGradesTabMainBodyProps {
  bookId: string;
}
export const BookGradesTabMainBody: FC<BookGradesTabMainBodyProps> = ({ bookId }) => {
  const [pageSize] = useState(4);

  const [page, setPage] = useState(1);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const { data: bookReadings } = useErrorHandledQuery(
    FindBookReadingsQueryOptions({
      accessToken,
      userBookId: bookId,
      page,
      pageSize,
      sortDate: SortingType.desc,
    }),
  );

  const { data: userBookData, isFetching } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken,
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
    <>
      <div className="flex justify-between w-full">
        {isFetching && <Skeleton className="h-9 w-40" />}
        {isFetching && <Skeleton className="h-7 w-7" />}
        {!isFetching && <p className="font-semibold text-3xl w-1/2 block truncate">{userBookData?.book.title}</p>}
        {!isFetching && <CurrentRatingStar userBookId={bookId} />}
      </div>
      <Separator className="h-[1px] bg-primary" />
      <div className="flex flex-col w-full">
        {!isFetching && <p className="text-lg pb-6"> {userBookData?.book?.authors[0]?.name ?? ''} </p>}
        {isFetching && (
          <div className="pb-6">
            <Skeleton className="h-7 w-40" />
          </div>
        )}
        <DataTable
          tableContainerClassName="min-h-[32rem]"
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
      </div>
    </>
  );
};
