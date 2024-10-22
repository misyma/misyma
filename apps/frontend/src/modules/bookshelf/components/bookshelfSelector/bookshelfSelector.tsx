import { FC, KeyboardEvent } from 'react';
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
    onKeyDown
}) => {
  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: 100,
  });

  return (
    <SelectTrigger className="text-start">
      <SelectValue placeholder="Półka" />
      <SelectContent>
        {bookshelvesData?.data
          .filter((bookshelf) => bookshelf.name !== 'Wypożyczalnia')
          .map((bookshelf) => (
            <SelectItem
              className="text-start"
              onKeyDown={onKeyDown}
              value={bookshelf.id}
            >
              {bookshelf.name}
            </SelectItem>
          ))}
      </SelectContent>
    </SelectTrigger>
  );
};
