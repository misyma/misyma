import { Book, FindAdminBooksQueryParams } from '@common/contracts';
import {
  BookTableProvider,
  useBookTableContext,
} from '../../book/components/bookTable/bookTableContext';
import { FC, useEffect, useMemo } from 'react';
import { bookTableColumns } from '../../book/components/bookTable/bookTableColumns';
import { BookTable } from '../../book/components/bookTable/bookTable';
import { cn } from '../../common/lib/utils';
import { useAdminFindBooksQuery } from '../../book/api/admin/queries/findBooksQuery/findBooksQueryOptions';
import { useInitialFetch } from '../../common/hooks/useInitialFetch';

interface TableContainerProps {
  pageCount: number;
  pageSize: number;
  pageIndex: number;
  itemsCount: number;
  onSetPage: (val: number) => void;
  data: Book[];
  loading: boolean;
}
const TableContainer: FC<TableContainerProps> = ({
  itemsCount,
  onSetPage,
  pageCount,
  pageIndex,
  pageSize,
  data,
  loading,
}) => {
  const { setLoading } = useBookTableContext();

  useEffect(() => setLoading(loading), [loading, setLoading]);

  return (
    <div className="flex items-center justify-start w-100% py-1 sm:py-4">
      <BookTable
        data={data}
        columns={bookTableColumns}
        pageCount={pageCount}
        onSetPage={onSetPage}
        pageSize={pageSize}
        pageIndex={pageIndex}
        itemsCount={itemsCount}
      />
    </div>
  );
};

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
  const { data: booksData, isFetching } = useAdminFindBooksQuery({
    all: true,
    ...params,
  });

  const { isLoading } = useInitialFetch({ isFetching });

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

  return (
    <div
      className={cn(
        `flex flex-col justify-start w-[100%] col-span-4`,
        TableSizing[isFilterVisible ? 'visible' : 'invisible']
      )}
    >
      <BookTableProvider>
        <TableContainer
          data={data}
          loading={isLoading}
          pageCount={pageCount}
          pageSize={Number(params.pageSize)}
          pageIndex={Number(params.page)}
          itemsCount={booksData?.metadata.total as number}
          onSetPage={onSetPage}
        />
      </BookTableProvider>
    </div>
  );
};
