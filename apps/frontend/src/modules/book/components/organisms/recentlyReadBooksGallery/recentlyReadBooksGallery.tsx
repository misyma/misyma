import { useQuery } from '@tanstack/react-query';

import { FindUserBooksSortField } from '@common/contracts';

import { BookCard } from '../../../../bookshelf/components/bookCard/bookCard.js';
import { Skeleton } from '../../../../common/components/skeleton/skeleton.js';
import { FindUserBooksByQueryOptions } from '../../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions.js';

export const RecentlyReadBooksGallery = () => {
  const { data, isLoading } = useQuery(
    FindUserBooksByQueryOptions({
      pageSize: 5,
      sortField: FindUserBooksSortField.readingDate,
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ostatnio przeczytane książki</h1>
      <div className="grid gap-4 grid-cols-5">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              className="w-full sm:[320px] md:h-[324px] 2xl:h-[344px]"
              key={`f-b-sk-${i}`}
            />
          ))}
        {data?.data.map((ub, index) => (
          <BookCard
            className={index === 0 ? 'col-start-1' : ''}
            book={ub}
            pageNumber={1}
            isBorrowed={false}
            key={`recently-read-book-${index}`}
          />
        ))}
      </div>
    </div>
  );
};
