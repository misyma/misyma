import { type FC, useEffect, useMemo, useState } from 'react';

import { type Book, type FindAdminBooksQueryParams } from '@common/contracts';

import { useAdminFindBooksQuery } from '../../book/api/admin/queries/findBooksQuery/findBooksQueryOptions';
import { bookTableColumns } from '../../book/components/organisms/bookTable/bookTableColumns';
import { DataSkeletonTable } from '../../common/components/dataTable/dataSkeletonTable';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { cn } from '../../common/lib/utils';

const TableSizing = {
  visible: `sm:col-span-4 md:col-span-5`,
  invisible: `sm:col-span-5 md:col-span-6`,
} as const;

interface BooksTableProps {
  isFilterVisible: boolean;
  params: FindAdminBooksQueryParams;
  onSetPage: (val: number) => void;
}

export const BooksTable: FC<BooksTableProps> = ({ onSetPage, params, isFilterVisible }) => {
  const {
    data: booksData,
    isFetching,
    isFetched,
  } = useAdminFindBooksQuery({
    all: true,
    ...params,
    sortField: params.sortField,
    sortOrder: params.sortOrder,
  });

  const [totalPages, setTotalPages] = useState(0);

  const pageCount = useMemo(() => {
    return Math.ceil((booksData?.metadata?.total ?? 0) / Number(params.pageSize)) || 1;
  }, [booksData?.metadata.total, params.pageSize]);

  const data = useMemo<Book[]>(() => {
    if (!booksData?.data && !isFetched) {
      return [
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
        {
          authors: [],
        },
      ] as unknown as Book[];
    }

    return booksData?.data ?? [];
  }, [booksData?.data, isFetched]);

  useEffect(() => {
    if (isFetched) {
      setTotalPages(Math.ceil(Number(booksData?.metadata.total) / Number(params.pageSize)) || 1);
    }
  }, [isFetched, booksData, params.pageSize]);

  return (
    <div
      className={cn(
        `flex flex-col justify-start w-[100%] col-span-full`,
        TableSizing[isFilterVisible ? 'visible' : 'invisible'],
      )}
    >
      {isFetching && (
        <DataSkeletonTable
          columns={bookTableColumns}
          onSetPage={onSetPage}
          pageSize={Number(params.pageSize)}
          pageCount={totalPages}
          pageIndex={Number(params.page)}
          skeletonHeight={6}
          PaginationSlot={totalPages === 0 ? <></> : null}
          itemsCount={booksData?.metadata.total}
        />
      )}
      {!isFetching && (
        <DataTable
          data={data}
          columns={bookTableColumns}
          pageCount={pageCount}
          pageSize={Number(params.pageSize)}
          pageIndex={Number(params.page)}
          onSetPage={onSetPage}
          itemsCount={booksData?.metadata.total}
        />
      )}
    </div>
  );
};
