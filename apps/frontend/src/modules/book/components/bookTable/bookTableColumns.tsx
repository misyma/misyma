import { type ColumnDef } from '@tanstack/react-table';
import { Book } from '@common/contracts';
import { HiCheckCircle } from 'react-icons/hi';
import { HiXCircle } from 'react-icons/hi';
import { ImQuill } from 'react-icons/im';
import { DeleteBookModal } from '../deleteBookModal/deleteBookModal';
import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface Props {
  bookId: string;
}

const NavigateToEdit = ({ bookId }: Props): ReactNode => {
  const navigate = useNavigate();

  return (
    <ImQuill
      onClick={() =>
        navigate({
          to: `/admin/books/${bookId}/edit`,
        })
      }
      className="cursor-pointer text-primary text-3xl"
    />
  );
};

export const bookTableColumns: ColumnDef<Book>[] = [
  {
    header: () => <p>Tytuł</p>,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original.title}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>ISBN</p>,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original?.isbn ?? '-'}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Format</p>,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original?.format ?? '-'}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Potwierdzona</p>,
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
    header: () => <p>Akcje</p>,
    accessorKey: 'actions',
    cell: ({ row }): JSX.Element => {
      const book = row.original;

      return (
        <div className="flex items-center gap-2">
          <NavigateToEdit bookId={book.id} />
          <DeleteBookModal
            bookId={book.id}
            bookName={book.title}
          />
        </div>
      );
    },
  },
];
