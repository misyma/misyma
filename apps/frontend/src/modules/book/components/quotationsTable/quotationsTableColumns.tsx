import { type ColumnDef } from '@tanstack/react-table';
import { Quote } from '@common/contracts';
import { FavoriteQuotationButton } from '../../../../modules/book/components/favoriteQuotationButton/favoriteQuotationButton';
import { QuotationText } from '../quotationText/quotationText';

export const columns: ColumnDef<Quote>[] = [
  {
    header: () => <></>,
    accessorKey: 'updatedAt',
    cell: ({ row, table }): JSX.Element => {
      return (
        <div className="flex flex-wrap flex-col py-4 gap-4">
          <div className="flex gap-2 justify-start items-start">
            <FavoriteQuotationButton quote={row.original} />
            <QuotationText
              content={row.original.content}
              pageIndex={table.getState().pagination.pageIndex * table.getState().pagination.pageSize}
              index={row.index}
            />
          </div>
          <p className="font-light ml-4 inline-flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            {new Date(row.original.createdAt).toLocaleDateString('pl-PL')}{' '}
            {row.original.page ? `, strony: ${row.original.page}` : ''}
          </p>
        </div>
      );
    },
  },
];
