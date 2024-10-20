import { CellContext, type ColumnDef } from '@tanstack/react-table';
import { Book } from '@common/contracts';
import { ReversedLanguages } from '../../../common/constants/languages';
import { BookFormat } from '../../../common/constants/bookFormat';
import { DeleteBookModal } from '../deleteBookModal/deleteBookModal';
import { TableHeader } from '../../../common/components/tableHeader/tableHeader';
import { AdminEditBookModal } from '../adminEditBookModal/adminEditBookModal';
import { FC, useEffect, useRef, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';
import { ChangeBookStatusModal } from '../changeBookStatusModal/changeBookStatusModal';

type CellProps = CellContext<Book, unknown>;

const AuthorCell: FC<{ label: string }> = ({ label }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const parentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!parentRef.current) return;
    const clone = parentRef.current.cloneNode(true) as HTMLParagraphElement;
    clone.id = '';
    clone.classList.remove('custom-truncate');
    clone.classList.add('custom-inline');
    const root = document.querySelector('body');
    root?.append(clone);
    const originalWidth = parentRef.current.getBoundingClientRect().width;
    const cloneWidth = clone.getBoundingClientRect().width;
    setIsTruncated(originalWidth < cloneWidth);
    clone.remove();
  }, [label]);

  const content = (
    <p ref={parentRef} className="text-base truncate">
      {label ?? '-'}
    </p>
  );

  return (
    <div className="flex flex-col py-4 gap-2 max-w-[150px]">
      <div className="flex items-center gap-1">
        {isTruncated ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <p className="whitespace-normal break-words">{label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

const TitleCell: FC<CellProps> = ({ row }) => {
  return (
    <div className="flex flex-col py-4 gap-2 w-[450px] truncate">
      <div className="flex items-center gap-1 w-full">
        <p className="text-base truncate">{row.original.title}</p>
      </div>
    </div>
  );
};

const LanguageCell: FC<CellProps> = ({ row }) => {
  return (
    <div style={{ width: '75px' }} className="flex flex-col py-4 gap-2">
      <div className="flex items-center gap-1">
        <p className="text-base truncate">
          {row.original.language
            ? ReversedLanguages[row.original.language]?.toLowerCase()
            : '-'}
        </p>
      </div>
    </div>
  );
};

const IsbnCell: FC<CellProps> = ({ row }) => {
  return (
    <div className="flex flex-col py-4 gap-2">
      <div className="flex items-center gap-1">
        <p className="text-base truncate">{row.original?.isbn ?? '-'}</p>
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

const FormatCell: FC<CellProps> = ({ row }) => {
  return (
    <div className="flex flex-col py-4 gap-2 w-[125px]">
      <div className="flex items-center gap-1">
        <p className="text-base whitespace-nowrap w-[125px]">
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
      <DeleteBookModal bookId={book.id} bookName={book.title} />
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
    header: () => <TableHeader label="Język" />,
    accessorKey: 'language',
    minSize: 75,
    size: 125,
    maxSize: 150,
    cell: LanguageCell,
  },
  {
    header: () => <TableHeader label="Autorzy" />,
    accessorKey: 'authors',
    minSize: 125,
    size: 150,
    maxSize: 175,
    cell: ({ row }): JSX.Element => {
      return (
        <AuthorCell
          label={
            row.original.authors.map((author) => author.name).join(', ') ?? ''
          }
        />
      );
    },
  },
  {
    header: () => <TableHeader className="w-[125px]" label="ISBN" />,
    minSize: 75,
    size: 125,
    maxSize: 150,
    accessorKey: 'isbn',
    cell: IsbnCell,
  },
  {
    header: () => <TableHeader className="w-[125px]" label="Format" />,
    minSize: 75,
    size: 125,
    maxSize: 150,
    accessorKey: 'format',
    cell: FormatCell,
  },
  {
    header: () => <TableHeader label="Status" />,
    minSize: 75,
    size: 125,
    maxSize: 150,
    accessorKey: 'isApproved',
    cell: StatusCell,
  },
  {
    header: () => <TableHeader label="Akcje" />,
    minSize: 75,
    size: 125,
    maxSize: 150,
    accessorKey: 'actions',
    cell: ActionsCell,
  },
];
