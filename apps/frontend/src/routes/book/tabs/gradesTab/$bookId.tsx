import { createFileRoute, Navigate } from '@tanstack/react-router'
import { z } from 'zod';


const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/book/tabs/gradesTab/$bookId')({
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
      {
        readableName: '$bookshelfName',
        href: '/bookshelf/$bookshelfId',
      },
      {
        readableName: '$bookName',
        href: '/book/tabs/basicDataTab/$bookId',
      },
      {
        readableName: 'Oceny',
        href: '/book/tabs/gradesTab/$bookId',
      },
    ],
  },
})