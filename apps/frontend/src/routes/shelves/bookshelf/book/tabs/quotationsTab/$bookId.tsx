import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

import { SortOrder } from '@common/contracts';

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
  sortDate: z.nativeEnum(SortOrder).optional(),
});

const bookQueryParamsSchema = z.object({
  sortDate: z.nativeEnum(SortOrder).catch(SortOrder.desc),
});

export const Route = createFileRoute('/shelves/bookshelf/book/tabs/quotationsTab/$bookId')({
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
  validateSearch: bookQueryParamsSchema,
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
      {
        readableName: '$bookshelfName',
        href: '/shelves/bookshelf/$bookshelfId',
      },
      {
        readableName: '$bookName',
        href: '/shelves/bookshelf/book/tabs/basicDataTab/$bookId',
      },
      {
        readableName: 'Cytaty',
        href: '/shelves/bookshelf/book/tabs/quotationsTab/$bookId',
      },
    ],
  },
});
