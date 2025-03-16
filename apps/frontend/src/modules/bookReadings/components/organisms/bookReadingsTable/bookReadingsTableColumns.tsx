import { type ColumnDef } from '@tanstack/react-table';
import { HiStar } from 'react-icons/hi';

import { type BookReading } from '@common/contracts';

import { Separator } from '../../../../common/components/separator/separator';
import { DeleteBookReadingModal } from '../deleteBookReadingModal/deleteBookReadingModal';
import { UpdateBookReadingModal } from '../updateReadingModal/updateReadingModal';

export const bookReadingsTableColumns: ColumnDef<BookReading>[] = [
  {
    header: () => <></>,
    accessorKey: 'updatedAt',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-2xl">{row.original.rating}</p>
              <HiStar className="h-8 w-8 text-primary" />
            </div>
            <div className="flex gap-2">
              <UpdateBookReadingModal bookReading={row.original} />
              <DeleteBookReadingModal
                readingId={row.original.id}
                userBookId={row.original.userBookId}
              />
            </div>
          </div>
          <p className="font-semibold text-lg">{row.original.comment}</p>
          <div className="font-light inline-flex items-center gap-2">
            rozpoczęcie czytania: {new Date(row.original.startedAt).toLocaleDateString('pl-PL')}
            <Separator className="w-[10%]" /> zakończenie czytania:{' '}
            {row.original.endedAt ? new Date(row.original.endedAt).toLocaleDateString('pl-PL') : ''}
          </div>
        </div>
      );
    },
  },
];
