import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

const bookshelfSearchSchema = z.object({
  bookshelfId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/shelves/bookshelf/$bookshelfId')({
  component: () => <div>Hello /bookshelf/$bookshelfId!</div>,
  parseParams: bookshelfSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/mybooks'} />;
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Moje książki',
        href: '/mybooks/',
      },
      {
        readableName: '$bookshelfName',
        href: `/shelves/bookshelf/$bookshelfId`,
      },
    ],
  },
});
