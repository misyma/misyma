import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { FC, useMemo, useState } from 'react';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useSelector } from 'react-redux';
import { quotationTableColumns } from '../quotationsTable/quotationsTableColumns';
import { getQuotesOptions } from '../../api/queries/getQuotes/getQuotesOptions';
import { QuotesApiQueryKeys } from '../../api/queries/quotesApiQueryKeys';
import { DataTable } from '../../../common/components/dataTable/dataTable';
import { Skeleton } from '../../../common/components/skeleton/skeleton';

interface QuotationTabTableProps {
  bookId: string;
}
export const QuotationTabTable: FC<QuotationTabTableProps> = ({ bookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);

  const { data: userData } = useFindUserQuery();

  const queryClient = useQueryClient();

  const {
    data: userBookData,
    isFetching,
    // isFetched: isUserBookFetched,
    // isFetching: isUserBookFetching,
    // isRefetching: isUserBookRefetching,
  } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  const {
    data: quotationsData,
    // isFetched: isQuotationsFetched,
    // isRefetching: isRefetchingQuotations,
    // isFetching: isQuotationsFetching,
  } = useQuery(
    getQuotesOptions({
      accessToken: accessToken as string,
      userBookId: bookId,
      page,
      pageSize,
    })
  );

  const pageCount = useMemo(() => {
    return Math.ceil((quotationsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [quotationsData?.metadata.total, pageSize]);

  const data = useMemo(() => {
    return quotationsData?.data ?? [];
  }, [quotationsData?.data]);

  const invalidateQuotesFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === QuotesApiQueryKeys.findQuotes &&
        query.queryKey[1] === bookId &&
        query.queryKey[2] === userData?.id &&
        query.queryKey[3] === `${page}` &&
        query.queryKey[4] === `${pageSize}`,
    });

  const onSetPage = (page: number): void => {
    setPage(page);

    invalidateQuotesFetch();
  };

  return (
    <div className="flex flex-col w-full">
      {!isFetching && (
        <p className="text-lg pb-6">
          {' '}
          {userBookData?.book?.authors[0]?.name ?? ''}{' '}
        </p>
      )}
      {isFetching && (
        <div className="pb-6">
          <Skeleton className="h-7 w-40" />
        </div>
      )}
      <DataTable
        hideHeaders={true}
        columns={quotationTableColumns}
        data={[...data]}
        onSetPage={onSetPage}
        pageCount={pageCount}
        pageIndex={page}
        pageSize={pageSize}
        itemsCount={quotationsData?.metadata.total}
        PaginationSlot={pageCount <= 1 ? <></> : null}
      />
    </div>
  );
};
