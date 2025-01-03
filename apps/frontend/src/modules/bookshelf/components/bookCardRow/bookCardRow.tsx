import { UserBook } from '@common/contracts';
import { FC } from 'react';
import { BookCard } from '../bookCard/bookCard';

export const BookCardRow: FC<{
  books: UserBook[];
  borrowedBooks?: boolean;
  pageNumber: number;
}> = ({ books, pageNumber, borrowedBooks = false }) => {
  return (
    <div className="grid grid-cols-6 gap-x-4 w-full px-2">
      {books.map((book, index) => (
        <BookCard
          book={book}
          pageNumber={pageNumber}
          key={`book-card-${index}`}
          isBorrowed={borrowedBooks}
        />
      ))}
    </div>
  );
};
