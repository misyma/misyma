import { createLazyFileRoute } from '@tanstack/react-router';

import { BookPage } from '../../../../modules/book/page/bookPage';

export const Route = createLazyFileRoute('/shelves/bookshelf/book/$bookId')({
  component: () => {
    return <BookPage from="shelves" />;
  },
});
