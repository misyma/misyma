import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { sortOrders } from '@common/contracts';

const querySchema = z.object({
  sortDate: z.nativeEnum(sortOrders).optional(),
  authorId: z.string().uuid().optional(),
  userBookId: z.string().uuid().optional(),
  isFavorite: z.boolean().optional(),
  content: z.string().optional(),
});

export type QuotePageSearch = z.infer<typeof querySchema>;

export const Route = createFileRoute('/quotes/')({
  validateSearch: querySchema,
});
