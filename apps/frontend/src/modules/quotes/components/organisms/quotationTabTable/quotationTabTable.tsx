import { type FC, useMemo, useState } from 'react';

import { type SortOrder } from '@common/contracts';

import { DataTable } from '../../../../common/components/dataTable/dataTable';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { getQuotesOptions } from '../../../api/queries/getQuotes/getQuotes';
import { quoteTableColumns } from '../quotesTable/quotesTableColumns';
import { ScrollArea } from '../../../../common/components/scrollArea/scroll-area';

interface QuotationTabTableProps {
  bookId: string;
  sortDate?: SortOrder;
}
export const QuotationTabTable: FC<QuotationTabTableProps> = ({ bookId, sortDate }) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);

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
      <ScrollArea type='always' className='h-[22rem] w-full'>
        <DataTable
          tableContainerClassName='min-h-[unset] pr-2'
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
      </ScrollArea>
  );
};
