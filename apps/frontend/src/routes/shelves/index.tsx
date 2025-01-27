import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchParamsSchema = z.object({
  name: z.string().optional().catch(''),
});

export const Route = createFileRoute('/shelves/')({
  validateSearch: searchParamsSchema,
});
