import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/shelves/bookshelf/book/$bookId')({
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
        readableName: '$bookName',
        href: '/shelves/bookshelf/book/$bookId',
      },
    ],
  },
});
