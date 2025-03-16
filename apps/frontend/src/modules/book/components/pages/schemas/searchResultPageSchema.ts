import { z } from 'zod';

export const searchResultSchema = z.object({
  isbn: z.string().catch(''),
  title: z.string().min(1).catch(''),
  bookshelfId: z.string().uuid().catch(''),
  page: z.number().int().default(1).catch(1),
  searchBy: z.enum(['isbn', 'title']),
});

export type SearchResultSearch = z.infer<typeof searchResultSchema>;
