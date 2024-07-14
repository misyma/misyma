import { type ColumnDef } from '@tanstack/react-table';
import { BookReading } from '@common/contracts';
import { Separator } from '../../../common/components/separator/separator';
import { HiStar } from 'react-icons/hi';

export const columns: ColumnDef<BookReading>[] = [
  {
    header: () => <></>,
    accessorKey: 'updatedAt',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className='flex items-center gap-1'>
            <p className='font-semibold text-2xl'>{row.original.rating}</p>
            <HiStar className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-lg">{row.original.comment}</p>
          <p className="font-light inline-flex items-center gap-2">
            rozpoczęcie czytania: {new Date(row.original.startedAt).toLocaleDateString('pl-PL')}
            <Separator className="w-[10%]" />{' '}
            zakończenie czytania: {row.original.endedAt ? new Date(row.original.endedAt).toLocaleDateString('pl-PL') : ''}
          </p>
        </div>
      );
    },
  },
];
