import { type ColumnDef } from '@tanstack/react-table';
import { Book } from '@common/contracts';
import { HiCheckCircle } from 'react-icons/hi';
import { HiXCircle } from 'react-icons/hi';
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

const AuthorCell: FC<{ label: string }> = ({ label }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const parentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!parentRef.current) {
      return;
    }

    const clone = parentRef.current.cloneNode(true) as HTMLParagraphElement;
    clone.id = '';
    clone.classList.remove('custom-truncate');
    clone.classList.add('custom-inline');
    const root = document.querySelector('body');
    root?.append(clone);

    const originalWidth = parentRef.current.getBoundingClientRect().width;
    const cloneWidth = clone.getBoundingClientRect().width;

    if (originalWidth < cloneWidth) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }

    clone.remove();
  }, [label]);

  const content = (
    <p ref={parentRef} className="text-base truncate max-w-60">
      {label ?? '-'}
    </p>
  );

  return (
    <div className="flex flex-col py-4 gap-2">
      <div className="flex items-center gap-1">
        {isTruncated ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <p className="whitespace-normal break-words">{label}</p>
              </TooltipContent>{' '}
            </Tooltip>
          </TooltipProvider>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export const bookTableColumns: ColumnDef<Book>[] = [
  {
    header: () => <TableHeader label="Tytuł" />,
    accessorKey: 'title',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2 sm:w-80 md:w-[32rem] truncate">
          <div className="flex items-center gap-1 sm:w-80 md:w-[32rem]">
            <p className="text-base truncate">
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
            <p className="text-base">
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
        <AuthorCell
          label={
            row.original.authors.map((author) => author.name).join(', ') ?? ''
          }
        />
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
            <p className="text-base truncate">{row.original?.isbn ?? '-'}</p>
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
            <p className="text-base whitespace-nowrap">
              {row.original?.format ? BookFormat[row.original?.format] : '-'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Status" />,
    accessorKey: 'isApproved',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="max-w-16 flex justify-center items-center gap-1">
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
