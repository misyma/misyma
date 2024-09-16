import { type ColumnDef } from '@tanstack/react-table';
import { Book } from '@common/contracts';
import { HiCheckCircle } from 'react-icons/hi';
import { HiXCircle } from 'react-icons/hi';
import { ReversedLanguages } from '../../../common/constants/languages';
import { BookFormat } from '../../../common/constants/bookFormat';
import { DeleteBookModal } from '../deleteBookModal/deleteBookModal';
import { TableHeader } from '../../../common/components/tableHeader/tableHeader';
import { AdminEditBookModal } from '../adminEditBookModal/adminEditBookModal';

export const bookTableColumns: ColumnDef<Book>[] = [
  {
    header: () => <TableHeader label="Tytuł" />,
    accessorKey: 'title',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2 w-full">
          <div className="flex items-center gap-1 max-w-xl">
            <p className="text-lg sm:max-w-48 lg:max-w-60 truncate">
              {row.original.title}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Język" />,
    accessorKey: 'language',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-lg">
              {row.original.language
                ? ReversedLanguages[row.original.language]?.toLowerCase()
                : '-'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Autorzy" />,
    accessorKey: 'authors',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-lg truncate max-w-48">
              {row.original.authors.length > 0
                ? row.original.authors.map((author) => author.name).join(', ')
                : '-'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="ISBN" />,
    accessorKey: 'isbn',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-lg truncate">{row.original?.isbn ?? '-'}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Format" />,
    accessorKey: 'format',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-lg whitespace-nowrap">
              {row.original?.format ? BookFormat[row.original?.format] : '-'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Potwierdzona" />,
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
      const book = row.original;

      return (
        <div className="flex items-center gap-2">
          <AdminEditBookModal bookId={book.id} />
          <DeleteBookModal bookId={book.id} bookName={book.title} />
        </div>
      );
    },
  },
];
