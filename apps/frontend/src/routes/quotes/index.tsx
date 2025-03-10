import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { SortOrder } from '@common/contracts';

const querySchema = z.object({
  sortDate: z.nativeEnum(SortOrder).optional(),
});

export const Route = createFileRoute('/quotes/')({
  validateSearch: querySchema,
});
