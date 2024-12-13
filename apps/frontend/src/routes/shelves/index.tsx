import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const schema = z.object({
  page: z.number().min(1).catch(1),
  perPage: z.number().min(1).catch(7),
  name: z.string().optional(),
});

export const Route = createFileRoute('/shelves/')({
  validateSearch: schema,
});
