import { type CellContext, type ColumnDef } from '@tanstack/react-table';
import { type FC } from 'react';

import { type Book } from '@common/contracts';

import { TableHeader } from '../../../../common/components/tableHeader/tableHeader';
import { TruncatedTextTooltip } from '../../../../common/components/truncatedTextTooltip/truncatedTextTooltip';
import { BookFormat } from '../../../../common/constants/bookFormat';
import { ReversedLanguages } from '../../../../common/constants/languages';
import { AdminEditBookModal } from '../adminEditBookModal/adminEditBookModal';
import { ChangeBookStatusModal } from '../changeBookStatusModal/changeBookStatusModal';
import { DeleteBookModal } from '../deleteBookModal/deleteBookModal';

type CellProps = CellContext<Book, unknown>;

const AuthorCell: FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex flex-col py-4 gap-2 max-w-[200px]">
      <div className="flex items-center gap-1">
        <TruncatedTextTooltip text={label}>
          <p className="text-base truncate">{label ?? '-'}</p>
        </TruncatedTextTooltip>
      </div>
    </div>
  );
};

const TitleCell: FC<CellProps> = ({ row }) => {
  return (
    <div className="flex flex-col py-4 gap-2 w-[450px] truncate">
      <div className="flex items-center gap-1 w-full">
        <TruncatedTextTooltip text={row.original.title}>
          <p className="text-base truncate">{row.original.title}</p>
        </TruncatedTextTooltip>
      </div>
    </div>
  );
};

const GenreCell: FC<CellProps> = ({ row, column }) => {
  return (
    <div
      style={{ width: `${column.getSize()}px` }}
      className="flex flex-col py-4 gap-2"
    >
      <div className="flex items-center gap-1">
        <TruncatedTextTooltip text={row.original.genreName}>
          <p className="text-base truncate">{row.original.genreName !== '' ? row.original.genreName : '-'}</p>
        </TruncatedTextTooltip>
      </div>
    </div>
  );
};

const LanguageCell: FC<CellProps> = ({ row, column }) => {
  return (
    <div
      style={{ width: `${column.getSize()}px` }}
      className="flex flex-col py-4 gap-2"
    >
      <div className="flex items-center gap-1">
        <p className="text-base truncate">
          {row.original.language ? ReversedLanguages[row.original.language]?.toLowerCase() : '-'}
        </p>
      </div>
    </div>
  );
};

const IsbnCell: FC<CellProps> = ({ row, column }) => {
  return (
    <div
      style={{
        width: `${column.getSize()}px`,
      }}
      className="flex flex-col py-4 gap-2"
    >
      <div className="flex items-center gap-1">
        <p
          style={{
            width: `${column.getSize()}px`,
          }}
          className="text-base truncate"
        >
          {row.original?.isbn ?? '-'}
        </p>
      </div>
    </div>
  );
};

const StatusCell: FC<CellProps> = ({ row, table }) => {
  return (
    <div className="max-w-16 flex justify-center items-center gap-1">
      <ChangeBookStatusModal
        book={row.original}
        page={table.getState().pagination.pageIndex}
      />
    </div>
  );
};

const FormatCell: FC<CellProps> = ({ row, column }) => {
  return (
    <div
      style={{
        width: `${column.getSize()}px`,
      }}
      className="flex flex-col py-4 gap-2"
    >
      <div className="flex items-center gap-1">
        <p
          style={{
            width: `${column.getSize()}px`,
          }}
          className="text-base whitespace-nowrap"
        >
          {row.original?.format ? BookFormat[row.original?.format] : '-'}
        </p>
      </div>
    </div>
  );
};

const ActionsCell: FC<CellProps> = ({ row }) => {
  const book = row.original;

  return (
    <div className="flex items-center gap-2">
      <AdminEditBookModal bookId={book.id} />
      <DeleteBookModal
        bookId={book.id}
        bookName={book.title}
      />
    </div>
  );
};

export const bookTableColumns: ColumnDef<Book>[] = [
  {
    header: () => <TableHeader label="Tytuł" />,
    accessorKey: 'title',
    minSize: 150,
    size: 450,
    maxSize: 450,
    cell: TitleCell,
  },
  {
    header: () => <TableHeader label="Gatunek" />,
    accessorKey: 'genre',
    minSize: 100,
    size: 100,
    maxSize: 150,
    cell: GenreCell,
  },
  {
    header: () => <TableHeader label="Język" />,
    accessorKey: 'language',
    minSize: 100,
    size: 100,
    maxSize: 150,
    cell: LanguageCell,
  },
  {
    header: () => <TableHeader label="Autorzy" />,
    accessorKey: 'authors',
    minSize: 125,
    size: 175,
    maxSize: 200,
    cell: ({ row }): JSX.Element => {
      return <AuthorCell label={row.original.authors.map((author) => author.name).join(', ') ?? ''} />;
    },
  },
  {
    header: () => (
      <TableHeader
        className="w-[125px]"
        label="ISBN"
      />
    ),
    minSize: 125,
    size: 150,
    maxSize: 175,
    accessorKey: 'isbn',
    cell: IsbnCell,
  },
  {
    header: () => (
      <TableHeader
        className="w-[125px]"
        label="Format"
      />
    ),
    minSize: 100,
    size: 100,
    maxSize: 150,
    accessorKey: 'format',
    cell: FormatCell,
  },
  {
    header: () => <TableHeader label="Status" />,
    minSize: 125,
    size: 125,
    maxSize: 150,
    accessorKey: 'isApproved',
    cell: StatusCell,
  },
  {
    header: () => <TableHeader label="Akcje" />,
    minSize: 125,
    size: 125,
    maxSize: 150,
    accessorKey: 'actions',
    cell: ActionsCell,
  },
];
