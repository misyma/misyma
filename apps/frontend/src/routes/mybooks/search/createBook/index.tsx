import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

const createBookSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/mybooks/search/createBook/')({
  validateSearch: createBookSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/mybooks'} />;
  },
});
