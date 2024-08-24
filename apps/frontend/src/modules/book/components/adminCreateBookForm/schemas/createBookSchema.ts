import { BookFormat, ReadingStatus } from '@common/contracts';
import { z } from 'zod';

export const createBookSchema = z.object({
  authorIds: z.array(z.string().uuid()),
  bookshelfId: z.string().uuid(),
  format: z.nativeEnum(BookFormat),
  language: z.string().min(1),
  status: z.nativeEnum(ReadingStatus),
  title: z.string().min(1),
  imageUrl: z.optional(z.string().url()),
  isbn: z.optional(z.string()),
  pages: z.optional(z.number().finite().positive()),
  publisher: z.optional(z.string()),
  releaseYear: z.optional(z.number().finite().min(100).max(2999)),
  translator: z.optional(z.string().min(1).max(64)),
});

export type CreateBookSchemaValues = z.infer<typeof createBookSchema>;
