import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { SearchBookPage } from '../../../../modules/book/page/searchBookPage';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';

const searchSchema = z.object({
  type: z.enum(['isbn', 'title']).catch('isbn'),
  next: z.number().int().min(0).max(1).catch(0),
  bookshelfId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/shelves/bookshelf/search/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchBookPage from="/shelves/bookshelf/search/" />
      </RequireAuthComponent>
    );
  },
  validateSearch: (search) => searchSchema.parse(search),
});
