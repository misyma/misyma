import { type ColumnDef } from '@tanstack/react-table';
import { Book } from '@common/contracts';
import { HiCheckCircle } from 'react-icons/hi';
import { HiXCircle } from 'react-icons/hi';
import { ImQuill } from 'react-icons/im';
import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ReversedLanguages } from '../../../common/constants/languages';
import { BookFormat } from '../../../common/constants/bookFormat';
import { DeleteBookModal } from '../deleteBookModal/deleteBookModal';

interface Props {
  bookId: string;
}

const NavigateToEdit = ({ bookId }: Props): ReactNode => {
  const navigate = useNavigate();

  return (
    <ImQuill
      onClick={() =>
        navigate({
          to: `/admin/tabs/books/edit/${bookId}`,
        })
      }
      className="cursor-pointer text-primary text-3xl"
    />
  );
};

export const bookTableColumns: ColumnDef<Book>[] = [
  {
    header: () => <p>Tytuł</p>,
    accessorKey: 'title',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2 w-full">
          <div className="flex items-center gap-1 max-w-xl">
            <p className="font-semibold text-lg max-w-80 truncate">{row.original.title}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Język</p>,
    accessorKey: 'language',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">
              {row.original.language ? ReversedLanguages[row.original.language]?.toLowerCase() : '-'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Autorzy</p>,
    accessorKey: 'authors',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg truncate max-w-32">
              {row.original.authors.length > 0 ? row.original.authors.map((author) => author.name).join(', ') : '-'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>ISBN</p>,
    accessorKey: 'isbn',
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
    accessorKey: 'format',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original?.format ? BookFormat[row.original?.format] : '-'}</p>
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
