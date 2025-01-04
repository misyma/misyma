import { useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';

import { AutoselectedInput } from '../../../common/components/autoselectedInput/autoselectedInput';

interface BookshelfNameProps {
  index: number;
  editMap: Record<number, boolean>;
  name: string;
  bookshelfId: string;
  onSave: (index: number) => void;
}
export const BookshelfName: FC<BookshelfNameProps> = ({ editMap, index, name, bookshelfId, onSave }) => {
  const navigate = useNavigate();

  return (
    <h2
      id={`name-${index}-bookshelf`}
      onClick={() => {
        if (editMap[index] === true) {
          return;
        }

        navigate({
          to: `/bookshelf/${bookshelfId}`,
        });
      }}
      className="cursor-pointer pl-0 md:pl-4 lg:pl-12 text-lg sm:text-2xl truncate"
      key={`${bookshelfId}-${name}`}
    >
      {editMap[index] !== true ? (
        name
      ) : (
        <AutoselectedInput
          type="text"
          maxLength={64}
          includeQuill={false}
          id={`${index}-bookshelf`}
          className="z-30 bg-none pointer-events-auto text-lg  sm:text-2xl px-0 w-40 sm:w-72"
          containerClassName="z-30 pointer-events-auto bg-transparent w-40 sm:w-72"
          defaultValue={name}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSave(index);
            }
          }}
        />
      )}
    </h2>
  );
};
