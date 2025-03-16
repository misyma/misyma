import { type FC, Fragment, type KeyboardEvent, useMemo } from 'react';

import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../common/components/select/select';
import { useFindUserBookshelfsQuery } from '../../../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

interface BookshelfSelectorProps {
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}
export const BookshelfSelector: FC<BookshelfSelectorProps> = ({ onKeyDown }) => {
  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    pageSize: 100,
  });

  const bookshelves = useMemo(
    () => bookshelvesData?.data.filter((b) => b.name !== 'Wypożyczalnia' && b.name !== 'Archiwum') ?? [],
    [bookshelvesData],
  );

  return (
    <Fragment>
      <SelectTrigger className="text-start">
        <SelectValue placeholder="Półka"></SelectValue>
      </SelectTrigger>
      <SelectContent>
        {bookshelves.map((bookshelf) => (
          <SelectItem
            className="text-start"
            onKeyDown={onKeyDown}
            value={bookshelf.id}
            key={'bookshelf-selector-' + bookshelf.id}
          >
            {bookshelf.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Fragment>
  );
};
