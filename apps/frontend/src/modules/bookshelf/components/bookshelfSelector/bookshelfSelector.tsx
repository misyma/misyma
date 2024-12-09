import { FC, Fragment, KeyboardEvent, useMemo } from 'react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useFindUserBookshelfsQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

interface BookshelfSelectorProps {
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}
export const BookshelfSelector: FC<BookshelfSelectorProps> = ({
  onKeyDown,
}) => {
  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: 100,
  });

  const bookshelves = useMemo(
    () =>
      bookshelvesData?.data.filter(
        (b) => b.name !== 'Wypożyczalnia' && b.name !== 'Archiwum'
      ) ?? [],
    [bookshelvesData]
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
