import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/tabs/')({
  component: () => <Navigate to="/admin/tabs/authors" />,
});
