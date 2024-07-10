import { type ColumnDef } from '@tanstack/react-table';
import { BookChangeRequest } from '@common/contracts';
import { formatDate } from 'date-fns';
import { pl } from 'date-fns/locale';

export const changeRequestsColumns: ColumnDef<BookChangeRequest>[] = [
  {
    header: () => <p>ID</p>,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original.id}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Created at</p>,
    accessorKey: 'createdAt',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">
              {row.original?.createdAt
                ? formatDate(row.original?.createdAt, 'PPP', {
                    locale: pl,
                  })
                : ''}
            </p>
          </div>
        </div>
      );
    },
  },
];
