import { type ColumnDef } from '@tanstack/react-table';

export interface BookChangeRequestRow {
  key: string;
  currentValue: string;
  proposedValue: string;
}
export const changeRequestColumns: ColumnDef<BookChangeRequestRow>[] = [
  {
    header: () => <p>Element</p>,
    accessorKey: 'elementKey',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original.key}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Obecna wartość</p>,
    accessorKey: 'currentValue',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold line-through text-lg">
              {row.original.currentValue}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Zaproponowana wartość</p>,
    accessorKey: 'proposedValue',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex items-center gap-2">
          <p className="font-semibold text-primary text-lg">
            {row.original.proposedValue}
          </p>
        </div>
      );
    },
  },
];
