import { FC, Fragment, KeyboardEvent } from 'react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useFindUserBookshelfsQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

interface BookshelfSelectorProps {
  selectedValue: string;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}
export const BookshelfSelector: FC<BookshelfSelectorProps> = ({
  selectedValue,
  onKeyDown,
}) => {
  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: 100,
  });

  return (
    <Fragment>
      <SelectTrigger className="text-start">
        <SelectValue asChild placeholder="Półka">
          <span className="pointer-events-none">
            {bookshelvesData?.data?.find((b) => b.id === selectedValue)?.name}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {bookshelvesData?.data
          .filter((bookshelf) => bookshelf.name !== 'Wypożyczalnia')
          .map((bookshelf) => (
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
