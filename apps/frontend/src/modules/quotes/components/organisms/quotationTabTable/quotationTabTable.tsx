import { type FC, useMemo, useState } from 'react';

import { type SortOrder } from '@common/contracts';

import { QuotationsTabSortingButton } from './quotationsTabSortingButton';
import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { DataTable } from '../../../../common/components/dataTable/dataTable';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { getQuotesOptions } from '../../../api/queries/getQuotes/getQuotes';
import { quoteTableColumns } from '../quotesTable/quotesTableColumns';

interface QuotationTabTableProps {
  bookId: string;
  sortDate?: SortOrder;
}
export const QuotationTabTable: FC<QuotationTabTableProps> = ({ bookId, sortDate }) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);

  const { data: userBookData, isLoading } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { data: quotationsData } = useErrorHandledQuery(
    getQuotesOptions({
      userBookId: bookId,
      page,
      pageSize,
      sortDate,
    }),
  );

  const pageCount = useMemo(() => {
    return Math.ceil((quotationsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [quotationsData?.metadata.total, pageSize]);

  const data = useMemo(() => {
    return quotationsData?.data ?? [];
  }, [quotationsData?.data]);

  const onSetPage = (page: number): void => {
    setPage(page);
  };

  return (
    <div className="flex flex-col w-full">
      {!isLoading && (
        <div className="flex justify-between">
          <p className="text-lg pb-6"> {userBookData?.book?.authors[0]?.name ?? ''} </p>
          {(quotationsData?.data.length ?? 0) > 1 && (
            <QuotationsTabSortingButton from="/shelves/bookshelf/book/$bookId" />
          )}
        </div>
      )}
      {isLoading && (
        <div className="pb-6">
          <Skeleton className="h-7 w-40" />
        </div>
      )}
      <DataTable
        tableContainerClassName="min-h-[32rem]"
        hideHeaders={true}
        columns={quoteTableColumns}
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
