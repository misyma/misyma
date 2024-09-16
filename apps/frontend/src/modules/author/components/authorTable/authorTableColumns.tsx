import { type ColumnDef } from '@tanstack/react-table';
import { Author } from '@common/contracts';
import { HiCheckCircle } from 'react-icons/hi';
import { HiXCircle } from 'react-icons/hi';
import { DeleteAuthorModal } from '../deleteAuthorModal/deleteAuthorModal';
import { ImQuill } from 'react-icons/im';
import { UpdateAuthorModal } from '../updateAuthorModal/updateAuthorModal';
import { TableHeader } from '../../../common/components/tableHeader/tableHeader';

export const columns: ColumnDef<Author>[] = [
  {
    header: () => <TableHeader label="Imię i nazwisko" />,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-lg">{row.original.name}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Potwierdzony" />,
    accessorKey: 'isApproved',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex justify-center items-center gap-1">
          {row.original.isApproved ? (
            <HiCheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <HiXCircle className="h-6 w-6 text-red-500" />
          )}
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Akcje" />,
    accessorKey: 'actions',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex items-center gap-2">
          <UpdateAuthorModal
            trigger={<ImQuill className="text-primary text-3xl" />}
            authorId={row.original.id}
            authorName={row.original.name}
            isApproved={row.original.isApproved}
            onMutated={() => {}}
          />
          <DeleteAuthorModal
            authorId={row.original.id}
            authorName={row.original.name}
          />
        </div>
      );
    },
  },
];
