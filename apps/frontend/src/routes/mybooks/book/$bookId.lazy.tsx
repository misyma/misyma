import { createLazyFileRoute } from '@tanstack/react-router';

import { BookPage } from '../../../modules/book/components/pages/bookPage';

export const Route = createLazyFileRoute('/mybooks/book/$bookId')({
  component: () => {
    return <BookPage from="books" />;
  },
});
