import { Book, FindAdminBooksQueryParams } from '@common/contracts';
import { FC, useEffect, useMemo, useState } from 'react';
import { bookTableColumns } from '../../book/components/bookTable/bookTableColumns';
import { cn } from '../../common/lib/utils';
import { useAdminFindBooksQuery } from '../../book/api/admin/queries/findBooksQuery/findBooksQueryOptions';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { DataSkeletonTable } from '../../common/components/dataTable/dataSkeletonTable';

const TableSizing = {
  visible: `sm:col-span-4 md:col-span-5`,
  invisible: `sm:col-span-5 md:col-span-6`,
} as const;

interface BooksTableProps {
  isFilterVisible: boolean;
  params: FindAdminBooksQueryParams;
  onSetPage: (val: number) => void;
}

export const BooksTable: FC<BooksTableProps> = ({
  onSetPage,
  params,
  isFilterVisible,
}) => {
  const {
    data: booksData,
    isFetching,
    isFetched,
  } = useAdminFindBooksQuery({
    all: true,
    ...params,
  });
  const [totalPages, setTotalPages] = useState(0);

  const pageCount = useMemo(() => {
    return (
      Math.ceil((booksData?.metadata?.total ?? 0) / Number(params.pageSize)) ||
      1
    );
  }, [booksData?.metadata.total, params.pageSize]);

  const data = useMemo<Book[]>(() => {
    return (
      booksData?.data ??
      ([
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
      ] as unknown as Book[])
    );
  }, [booksData?.data]);

  useEffect(() => {
    if (isFetched) {
      setTotalPages(
        Math.ceil(
          Number(booksData?.metadata.total) / Number(params.pageSize)
        ) || 1
      );
    }
  }, [isFetched, booksData, params.pageSize]);

  return (
    <div
      className={cn(
        `flex flex-col justify-start w-[100%] col-span-4`,
        TableSizing[isFilterVisible ? 'visible' : 'invisible']
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
