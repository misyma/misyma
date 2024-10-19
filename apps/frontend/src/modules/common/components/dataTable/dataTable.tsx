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
import { ReactNode, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table/table';
import { Paginator } from '../paginator/paginator';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onSetPage: (val: number) => Promise<void> | void;
  filterLabel?: string;
  includeColumnsSelector?: boolean;
  PaginationSlot?: ReactNode;
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  onSetPage,
  PaginationSlot,
}: DataTableProps<TData, TValue>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const state: Partial<TableState> = {
    sorting,
    columnFilters,
    columnVisibility,
  };

  if (pageIndex && pageSize) {
    state.pagination = {
      pageIndex,
      pageSize,
    };
  }

  const rowCount = useMemo(() => {
    return (pageCount ?? 0) * (pageSize ?? 0);
  }, [pageCount, pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      ...state,
    },
    rowCount,
    getRowId: (originalRow, index) => {
      if ('id' in originalRow && typeof originalRow.id === 'string') {
        return originalRow.id;
      }

      return index.toString();
    },
  });

  return (
    <div className="w-full md:max-w-screen-xl">
      <div className="w-full min-h-[22rem]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      style={{
                        width: `${header.getSize()}px`,
                      }}
                      className="p-4 m-0 h-14"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {PaginationSlot ?? (
        <div className="flex items-center justify-end space-x-2 py-4 mr-4">
          <Paginator
            onPageChange={onSetPage}
            includeArrows={true}
            pageIndex={pageIndex ?? 0}
            pagesCount={pageCount ?? 0}
            itemsCount={pageCount}
          />
        </div>
      )}
    </div>
  );
}
