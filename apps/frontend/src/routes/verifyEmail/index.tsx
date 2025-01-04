import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  token: z.string().min(1).catch(''),
});

export const Route = createFileRoute('/verifyEmail/')({
  validateSearch: searchSchema,
  onError: () => {
    return <Link to={'/login'} />;
  },
});
