import { createFileRoute } from '@tanstack/react-router';

import { searchResultSchema } from '../../../../modules/book/components/pages/schemas/searchResultPageSchema';

export const Route = createFileRoute('/mybooks/search/result/')({
  validateSearch: (search) => searchResultSchema.parse(search),
});
