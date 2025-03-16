import { useQuery } from '@tanstack/react-query';

import { FindUserBooksSortField } from '@common/contracts';

import { BookCard } from '../../atoms/bookCard/bookCard';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { FindUserBooksByQueryOptions } from '../../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';

export const TopBooksSection = () => {
  const { data, isLoading } = useQuery(
    FindUserBooksByQueryOptions({
      pageSize: 5,
      sortField: FindUserBooksSortField.rating,
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Najwyżej ocenione książki</h1>
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
            key={`top-book-${index}`}
          />
        ))}
      </div>
    </div>
  );
};
