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

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../components/ui/pagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onNextPage: () => Promise<void> | void;
  onPreviousPage: () => Promise<void> | void;
  onSetPage: (val: number) => Promise<void> | void;
}

export function GradesTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  onNextPage,
  onPreviousPage,
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
      pagination: {
        pageIndex,
        pageSize,
      },
      ...state,
    },
    rowCount,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

  const previousPage = useMemo(() => {
    if (currentPage === 1) {
      return undefined;
    }

    return currentPage - 1;
  }, [currentPage]);

  const nextPage = useMemo(() => {
    if (currentPage === pageCount) {
      return undefined;
    }

    if (currentPage === 1 && pageCount > 2) {
      return currentPage + 2;
    } else if (currentPage === 1 && pageCount <= 2) {
      return currentPage;
    }

    return currentPage + 1;
  }, [currentPage, pageCount]);

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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 mr-4">
        {table.getPageCount() > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  hasPrevious={currentPage !== 1}
                  onClick={() => {
                    onPreviousPage();

                    setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              <PaginationItem
                className={!table.getCanPreviousPage() ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
              >
                <PaginationLink
                  className={!table.getCanPreviousPage() ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''}
                  onClick={() => {
                    if (previousPage === undefined) {
                      return;
                    }

                    if (previousPage - 1 === -1) {
                      return;
                    }

                    if (currentPage === pageCount && pageCount === 2) {
                      onSetPage(currentPage - 2);

                      setCurrentPage(currentPage - 1);

                      return;
                    }

                    if (currentPage === pageCount) {
                      onSetPage(currentPage - 1);

                      setCurrentPage(currentPage - 2);

                      return;
                    }

                    onSetPage(previousPage - 1);

                    setCurrentPage(previousPage);
                  }}
                  isActive={previousPage === undefined}
                >
                  {previousPage !== undefined && currentPage === pageCount && pageCount > 2
                    ? currentPage - 2
                    : previousPage !== undefined
                      ? previousPage
                      : currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  isActive={
                    (currentPage !== 1 && currentPage !== pageCount) || (pageCount === 2 && currentPage === pageCount)
                  }
                  onClick={() => {
                    if (currentPage === 1) {
                      onSetPage(currentPage);

                      return setCurrentPage(currentPage + 1);
                    }

                    if (pageCount == currentPage && pageCount === 2) {
                      return;
                    }

                    if (currentPage === pageCount) {
                      onSetPage(currentPage - 2);
                      return setCurrentPage(pageCount - 1);
                    }
                  }}
                >
                  {currentPage !== 1
                    ? currentPage === pageCount && pageCount > 2
                      ? pageCount - 1
                      : currentPage
                    : currentPage + 1}
                </PaginationLink>
              </PaginationItem>
              {table.getPageCount() > 2 ? (
                <PaginationItem>
                  <PaginationLink
                    isActive={nextPage === undefined && currentPage !== 1 && currentPage === pageCount && pageCount > 2}
                    className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                    onClick={() => {
                      if (nextPage) {
                        onSetPage(nextPage - 1);
                        setCurrentPage(nextPage);
                      }
                    }}
                  >
                    {nextPage === undefined ? pageCount : nextPage}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <> </>
              )}
              <PaginationItem
                className={!table.getCanNextPage() ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
              >
                <PaginationNext
                  hasNext={table.getCanNextPage()}
                  className={!table.getCanNextPage() ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''}
                  onClick={() => {
                    onNextPage();

                    setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>{' '}
          </Pagination>
        )}
      </div>
    </div>
  );
}
