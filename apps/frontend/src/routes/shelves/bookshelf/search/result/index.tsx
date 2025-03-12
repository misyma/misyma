import { createFileRoute } from '@tanstack/react-router';

import { searchResultSchema } from '../../../../../modules/book/page/schemas/searchResultPageSchema';

export const Route = createFileRoute('/shelves/bookshelf/search/result/')({
  validateSearch: (search) => searchResultSchema.parse(search),
});
