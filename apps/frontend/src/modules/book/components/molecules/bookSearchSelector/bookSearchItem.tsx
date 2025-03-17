import { type FC } from 'react';

import { CommandItem } from '../../../../common/components/command/command';

interface BookSearchItemProps {
  size: number;
  transform: number;
  book: { label: string; value: string };
  onSelect: (value: string, label: string) => void;
}
export const BookSearchItem: FC<BookSearchItemProps> = ({ book, size, transform, onSelect }) => {
  return (
    <CommandItem
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: `${size}px`,
        width: '100%',
        transform: `translateY(${transform}px)`,
      }}
      onSelect={() => {
        onSelect(book.value, book.label);
      }}
      key={book?.value}
      className="cursor-pointer"
      value={book?.value}
    >
      <span>{book?.label}</span>
    </CommandItem>
  );
};
