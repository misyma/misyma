import { type FC } from 'react';

import { useBookshelves } from './hooks/useBookshelves';
import styles from './index.module.css';
import { ScrollArea } from '../../../common/components/scrollArea/scroll-area';
import { cn } from '../../../common/lib/utils';
import { BookshelfCard } from '../bookshelfCard/bookshelfCard';

interface Props {
  page: number;
  perPage: number;
  name: string | undefined;
}
export const BookshelfsList: FC<Props> = ({ page, perPage, name }) => {
  const { bookshelves } = useBookshelves({
    name,
    page,
    pageSize: perPage,
  });

  return (
    <ScrollArea className={cn(styles['shelves-scroll-area'], 'w-full')}>
      <div className={styles['shelves-container']}>
        {bookshelves?.map((bookshelf, index) => (
          <BookshelfCard
            bookshelf={bookshelf}
            key={`${index}-bookshelf`}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
