import { type ColumnDef } from '@tanstack/react-table';
import { Quote } from '@common/contracts';
import { FavoriteQuotationButton } from '../../../book/components/favoriteQuotationButton/favoriteQuotationButton';
import { QuotationText } from '../../../book/components/quotationText/quotationText';
import { DeleteQuoteModal } from '../deleteQuoteModal/deleteQuoteModal';
import { UpdateQuoteModal } from '../updateQuoteModal/updateQuoteModal';

export const quotationTableColumns: ColumnDef<Quote>[] = [
  {
    header: () => <></>,
    accessorKey: 'updatedAt',
    cell: ({ row, table }): JSX.Element => {
      const foundRow = table
        .getRowModel()
        .rows.find((row) => row.index === row.index);

      return (
        <div className="flex flex-wrap flex-col py-4 gap-4">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 justify-start items-between sm:w-104 md:w-[40rem] truncate">
              <FavoriteQuotationButton quote={row.original} />
              <QuotationText
                content={row?.original.content as string}
                pageIndex={
                  table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize
                }
                index={row.index}
              />
            </div>
            <div className="flex gap-2">
              <UpdateQuoteModal quote={{ ...row.original }} />
              <DeleteQuoteModal
                quoteId={foundRow?.original.id as string}
                userBookId={foundRow?.original.userBookId as string}
              />
            </div>
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
