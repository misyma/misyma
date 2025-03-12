import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

const booksSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/admin/tabs/books/edit/$id')({
  parseParams: booksSearchSchema.parse,
  validateSearch: booksSearchSchema,
  onError: () => {
    return <Navigate to={'/admin/tabs/books'} />;
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        href: '/admin/tabs/authors/',
        readableName: 'Admin',
      },
      {
        href: '/admin/tabs/books/',
        readableName: 'Książki',
      },
      {
        readableName: '$bookName',
        href: '/shelves/bookshelf/book/$bookId',
      },
    ],
  },
});
