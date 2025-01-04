import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  isbn: z.string().catch(''),
  title: z.string().min(1).catch(''),
  bookshelfId: z.string().uuid().catch(''),
  page: z.number().int().default(1).catch(1),
  searchBy: z.enum(['isbn', 'title']),
});

export const Route = createFileRoute('/shelves/bookshelf/search/result/')({
  validateSearch: (search) => searchSchema.parse(search),
});
