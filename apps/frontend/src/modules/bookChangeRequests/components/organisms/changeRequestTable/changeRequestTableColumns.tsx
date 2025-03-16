import { type ColumnDef } from '@tanstack/react-table';

import { TableHeader } from '../../../../common/components/tableHeader/tableHeader';

export interface BookChangeRequestRow {
  key: string;
  currentValue: string;
  proposedValue: string;
}

export const changeRequestColumns: ColumnDef<BookChangeRequestRow>[] = [
  {
    header: () => <TableHeader label="Element" />,
    accessorKey: 'elementKey',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">{row.original.key}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Obecna wartość" />,
    accessorKey: 'currentValue',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">{row.original.currentValue}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Zaproponowana wartość" />,
    accessorKey: 'proposedValue',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex items-center gap-2">
          <p className="text-base">{row.original.proposedValue}</p>
        </div>
      );
    },
  },
];
