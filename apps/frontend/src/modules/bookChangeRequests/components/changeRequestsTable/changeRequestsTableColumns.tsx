import { type ColumnDef } from '@tanstack/react-table';
import { BookChangeRequest } from '@common/contracts';

export const changeRequestsColumns: ColumnDef<BookChangeRequest>[] = [
  {
    header: () => <p>Imię i nazwisko</p>,
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
];
