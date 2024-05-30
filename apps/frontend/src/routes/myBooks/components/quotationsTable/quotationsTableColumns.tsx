import { type ColumnDef } from '@tanstack/react-table';
import { Quote } from '@common/contracts';

export const columns: ColumnDef<Quote>[] = [
  {
    header: () => <></>,
    accessorKey: 'updatedAt',
    cell: ({ row, table }): JSX.Element => {
      return (
        <div className="flex flex-col py-4">
          <p className="font-semibold text-lg">
            {row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize}.{' '}
            "{row.original.content}""
          </p>
          <p className="font-light ml-4 inline-flex items-center gap-2">
            <div className='h-1 w-1 rounded-full bg-primary'></div>
            {new Date(row.original.createdAt).toLocaleDateString('pl-PL')}, strony: {row.original.page}
          </p>
        </div>
      );
    },
  },
];
