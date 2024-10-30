import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const RouteSearchSchema = z.object({
  page: z
    .number({
      coerce: true,
    })
    .catch(1),
  pageSize: z
    .number({
      coerce: true,
    })
    .catch(10),
  name: z.string().catch(''),
});

export const Route = createFileRoute('/admin/tabs/authors/')({
  staticData: {
    routeDisplayableNameParts: [
      {
        href: '/admin/tabs/authors/',
        readableName: 'Admin',
      },
      {
        href: '/admin/tabs/authors/',
        readableName: 'Autorzy',
      },
    ],
  },
  validateSearch: (s) => RouteSearchSchema.parse(s),
});
