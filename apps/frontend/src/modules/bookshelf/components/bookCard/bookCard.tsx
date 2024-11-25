import { UserBook } from '@common/contracts';
import { FC, useState } from 'react';
import { BookImageMiniature } from '../../../book/components/bookImageMiniature/bookImageMiniature';

export const BookCard: FC<{ book: UserBook; key: string }> = ({
  book,
  key,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative" key={key}>
      <div
        className="aspect-[2/3] rounded-lg shadow-md shadow-primary transition-transform duration-300 ease-in-out hover:scale-110"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BookImageMiniature
          bookImageSrc={book.imageUrl}
          className="aspect-[2/3] w-full overflow"
          imageClassName="object-fill rounded-md"
        />
        {isHovered && (
          <div className="absolute pointer-events-none inset-0 p-4 text-white rounded-md transition-opacity duration-700 ease-in-out bg-black bg-opacity-70">
            <h3 className="text-lg font-bold mb-2">{book.book.title}</h3>
            <p className="text-sm">{book.book.authors[0].name}</p>
          </div>
        )}
      </div>
    </div>
  );
};
