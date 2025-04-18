import { useSearch } from '@tanstack/react-router';
import { type FC } from 'react';

import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';
import { CreateBookPageRevamp } from './createBookPageRevamp';

export const SearchBookPage: FC<{ from: string }> = ({ from }) => {
  const searchParams = useSearch({ from }) as { type: 'isbn' | 'title'; next: number; bookshelfId: string };

  // const render = () => {
  //   if (searchParams.next === 0) {
  //     return (
  //       <SearchBookMethodChoice
  //         bookshelfId={searchParams.bookshelfId}
  //         initialValue={searchParams.type}
  //       />
  //     );
  //   }

  //   if (searchParams.type === 'isbn') {
  //     return <IsbnSearchForm bookshelfId={searchParams.bookshelfId} />;
  //   }

  //   return <TitleSearchForm bookshelfId={searchParams.bookshelfId} />;
  // };

  return (
    <AuthenticatedLayout>
      <CreateBookPageRevamp />
      {/* <div className="flex justify-center items-center">
        {render()}
        <div className="flex max-w-[250px] w-full sm:max-w-[500px] sm:min-h-[550px] justify-center items-center">
          <img
            src="/books.png"
            alt="Books image"
            className="object-contain"
          />
        </div>
      </div> */}
    </AuthenticatedLayout>
  );
};
