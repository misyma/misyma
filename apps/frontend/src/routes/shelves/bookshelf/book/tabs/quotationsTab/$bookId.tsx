import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/shelves/bookshelf/book/tabs/quotationsTab/$bookId')({
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Moje książki',
        href: '/mybooks/',
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
