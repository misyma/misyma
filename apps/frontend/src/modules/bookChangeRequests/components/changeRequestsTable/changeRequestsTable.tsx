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
  type TableState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../common/components/table/table';
import { Input } from '../../../common/components/input/input';
import { Paginator } from '../../../common/components/paginator/paginator';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  itemsCount?: number;
  onSetPage: (val: number) => Promise<void> | void;
  searchTitle: string | undefined;
  setSearchTitle: (val: string) => void;
}

export function ChangeRequestsTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  itemsCount,
  onSetPage,
  searchTitle,
  setSearchTitle,
}: DataTableProps<TData, TValue>): JSX.Element {
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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualFiltering: true,
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
      <div className="flex items-center py-2">
        <Input
          placeholder="Wyszukaj po nazwie..."
          value={searchTitle ?? ''}
          onChange={(event) => setSearchTitle(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="w-full min-h-[22rem]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={`${headerGroup.id}-${headerGroup.depth}-${index}`}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={`${header.id}-${header.index}`}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  key={`${row.id}-${row.index}`}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
            pagesCount={pageCount}
            includeArrows={true}
            itemsCount={itemsCount}
          />
        )}
      </div>
    </div>
  );
}
