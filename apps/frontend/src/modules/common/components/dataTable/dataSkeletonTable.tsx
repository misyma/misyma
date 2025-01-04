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
import { type ReactNode, useMemo, useState } from 'react';

import { cn } from '../../lib/utils';
import { Paginator } from '../paginator/paginator';
import { Skeleton } from '../skeleton/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  pageIndex?: number;
  pageSize: number;
  pageCount?: number;
  itemsCount?: number;
  filterLabel?: string;
  includeColumnsSelector?: boolean;
  onSetPage: (val: number) => Promise<void> | void;
  skeletonHeight: number;
  skeletonBoxClass?: string;
  skeletonClassName?: string;
  PaginationSlot?: ReactNode;
}

export function DataSkeletonTable<TData extends object, TValue>({
  columns,
  pageIndex,
  pageSize = 10,
  pageCount,
  itemsCount,
  PaginationSlot,
  skeletonHeight,
  skeletonBoxClass,
  skeletonClassName,
  onSetPage,
}: DataTableProps<TData, TValue>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const state: Partial<TableState> = {
    sorting,
    columnFilters,
    columnVisibility,
  };

  if (pageIndex !== undefined && pageSize) {
    state.pagination = {
      pageIndex,
      pageSize,
    };
  }

  const data = useMemo(
    () =>
      Array.from({ length: pageSize }).map(() =>
        columns.reduce(
          (acc, column) => {
            if ('accessorKey' in column) {
              acc[column.accessorKey as string] = '';
            }

            return acc;
          },
          {} as Record<string, string>,
        ),
      ) as TData[],
    [columns, pageSize],
  );

  const rowCount = useMemo(() => (pageCount ?? 0) * pageSize, [pageCount, pageSize]);

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
  });

  return (
    <div className="w-full md:max-w-screen-xl">
      <div className="w-full min-h-[40rem]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    style={{
                      width: `${header.getSize()}px`,
                    }}
                    className="py-4 m-0 h-14"
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.map((_, index) => (
              <TableRow key={index}>
                {columns.map((column, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div className={cn(`w-full py-4`, skeletonBoxClass)}>
                      <Skeleton
                        className={cn(`h-${skeletonHeight}`, skeletonClassName)}
                        style={{
                          width: `${column.size}px`,
                        }}
                      />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
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
            itemsCount={itemsCount}
          />
        </div>
      )}
    </div>
  );
}
