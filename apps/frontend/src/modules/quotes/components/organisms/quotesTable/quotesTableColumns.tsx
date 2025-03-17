import { type ColumnDef } from '@tanstack/react-table';

import { type Quote } from '@common/contracts';

import { FavoriteQuoteButton } from '../../atoms/favoriteQuotationButton/favoriteQuoteButton';
import { Blockquote } from '../../molecules/blockQuote/blockQuote';
import { DeleteQuoteModal } from '../deleteQuoteModal/deleteQuoteModal';
import { UpdateQuoteButton } from '../updateQuoteModal/updateQuoteModal';

export const quoteTableColumns: ColumnDef<Quote>[] = [
  {
    header: () => <></>,
    accessorKey: 'updatedAt',
    cell: ({ row, table }): JSX.Element => {
      const foundRow = table.getRowModel().rows.find((row) => row.index === row.index);

      return (
        <div className="flex flex-wrap flex-col py-4 gap-4">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-3 justify-start items-between w-full">
              <Blockquote
                key={row.original.id}
                variant="minimalist"
                date={row.original.createdAt}
                page={row.original.page}
                rightButtons={
                  <>
                    <UpdateQuoteButton
                      key={row.original.id}
                      quote={row.original}
                    />
                    <DeleteQuoteModal
                      userBookId={foundRow?.original.userBookId as string}
                      quoteId={foundRow?.original.id as string}
                    />
                    <FavoriteQuoteButton quote={row.original} />
                  </>
                }
              >
                {row?.original.content ?? ''}
              </Blockquote>
            </div>
          </div>
        </div>
      );
    },
  },
];
