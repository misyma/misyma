import { useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';

import { BookshelfName } from './bookshelfName';
import { useBookshelves } from './hooks/useBookshelves';
import styles from './index.module.css';
import { ScrollArea } from '../../../common/components/scrollArea/scroll-area';
import { cn } from '../../../common/lib/utils';

interface BookshelfNavigationAreaProps {
  bookshelfId: string;
}
const BookshelfNavigationArea: FC<BookshelfNavigationAreaProps> = ({ bookshelfId }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        if (bookshelfId) {
          navigate({
            to: `/shelves/bookshelf/${bookshelfId}`,
          });
        }
      }}
      className={cn('absolute w-full h-[100%]', {
        ['cursor-pointer']: bookshelfId ? true : false,
      })}
    >
      &nbsp;
    </div>
  );
};

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
          <div
            className={cn(index > perPage - 1 ? 'hidden' : '')}
            key={`${bookshelf.id ?? 'temporary' + '-' + index}-container`}
          >
            <div
              key={`${bookshelf.id}`}
              className={styles['shelf']}
            >
              <BookshelfNavigationArea bookshelfId={bookshelf.id} />
              <div className="flex flex-col w-full">
                <div className="flex items-center h-full border-t-primary border-t-2 rounded-sm justify-between w-full top-0 pointer-events-none">
                  <BookshelfName
                    bookshelfId={bookshelf.id}
                    name={bookshelf.name}
                    index={index}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
