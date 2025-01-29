import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const AdminRouteSearchSchema = z.object({
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
  sortField: z.enum(['createdAt', 'releaseYear', '']).optional().catch(''),
  sortOrder: z.enum(['asc', 'desc', '']).optional().catch(''),
  title: z.string().catch(''),
  authorIds: z.string().catch(''),
  isbn: z.string().catch(''),
  language: z.string().catch(''),
  isApproved: z.boolean().optional(),
  releaseYearAfter: z
    .number({
      coerce: true,
    })
    .int()
    .optional(),
  releaseYearBefore: z
    .number({
      coerce: true,
    })
    .int()
    .optional(),
});

export const Route = createFileRoute('/admin/tabs/books/')({
  staticData: {
    routeDisplayableNameParts: [
      {
        href: '/admin/tabs/authors/',
        readableName: 'Admin',
      },
      {
        href: '/admin/tabs/books/',
        readableName: 'Książki',
      },
    ],
  },
  validateSearch: (s) => AdminRouteSearchSchema.parse(s),
});
