import { UserBook } from '@common/contracts';
import { FC } from 'react';
import { BookCard } from '../bookCard/bookCard';

export const BookCardRow: FC<{ books: UserBook[] }> = ({ books }) => {
  return (
    <div className="grid grid-cols-6 gap-x-4 w-full px-2">
      {books.map((book, index) => (
        <BookCard book={book} key={`book-card-${index}`} />
      ))}
    </div>
  );
};
