import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';

const changeRequestSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/admin/tabs/changeRequests/$id')({
  parseParams: changeRequestSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/admin/tabs/changeRequests'} />;
  },
});
