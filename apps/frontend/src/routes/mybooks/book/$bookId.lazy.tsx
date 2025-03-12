import { createLazyFileRoute } from '@tanstack/react-router';

import { BookPage } from '../../../modules/book/page/bookPage';

export const Route = createLazyFileRoute('/mybooks/book/$bookId')({
  component: () => {
    return <BookPage from="books" />;
  },
});
