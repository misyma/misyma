import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  type VisibilityState,
  getFilteredRowModel,
  type TableState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../common/components/table/table';
import { Paginator } from '../../../common/components/paginator/paginator';
import { BookReading } from '@common/contracts';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  itemsCount?: number;
  onSetPage: (val: number) => Promise<void> | void;
}

export function BookReadingsTable<TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  itemsCount,
  onSetPage,
}: DataTableProps<BookReading, TValue>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const state: Partial<TableState> = {
    sorting,
    columnFilters,
    columnVisibility,
  };

  const rowCount = useMemo(() => {
    return (pageCount ?? 0) * (pageSize ?? 0);
  }, [pageCount, pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (tData) => {
      return tData.id;
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      ...state,
    },
    rowCount,
  });

  return (
    <div className="w-full md:max-w-screen-xl ">
      <div className="w-full min-h-[22rem]">
        <Table>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center py-2"
                >
                  Brak wyników.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 mr-4">
        {table.getPageCount() > 1 && (
          <Paginator
            onPageChange={onSetPage}
            pageIndex={pageIndex}
            perPage={pageSize}
            pagesCount={pageCount}
            includeArrows={true}
            itemsCount={itemsCount}
          />
        )}
      </div>
    </div>
  );
}
