import { useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';

interface BookshelfNameProps {
  index: number;
  name: string;
  bookshelfId: string;
}
export const BookshelfName: FC<BookshelfNameProps> = ({ index, name, bookshelfId }) => {
  const navigate = useNavigate();

  return (
    <h2
      id={`name-${index}-bookshelf`}
      onClick={() => {
        navigate({
          to: `/bookshelf/${bookshelfId}`,
        });
      }}
      className="cursor-pointer pl-0 md:pl-4 lg:pl-12 text-lg sm:text-2xl truncate"
      key={`${bookshelfId}-${name}`}
    >
      {name}
    </h2>
  );
};
