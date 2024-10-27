import { createFileRoute } from '@tanstack/react-router';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { SearchBookMethodChoice } from '../../../modules/bookshelf/components/searchBookMethodChoice/searchMethodChoice';
import { IsbnSearchForm } from '../../../modules/bookshelf/components/isbnSearchForm/isbnSearchForm';
import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { TitleSearchForm } from '../../../modules/bookshelf/components/titleSearchForm/titleSearchForm';

export const Search = () => {
  const searchParams = Route.useSearch();

  const render = () => {
    if (searchParams.next === 0) {
      return (
        <SearchBookMethodChoice
          bookshelfId={searchParams.bookshelfId}
          initialValue={searchParams.type}
        />
      );
    }

    if (searchParams.type === 'isbn') {
      return <IsbnSearchForm bookshelfId={searchParams.bookshelfId} />;
    }

    return <TitleSearchForm bookshelfId={searchParams.bookshelfId} />;
  };

  return (
    <AuthenticatedLayout>
      <div className="flex justify-center items-center">
        {render()}
        <div className="flex max-w-[250px] w-full sm:max-w-[500px] sm:min-h-[550px] justify-center items-center">
          <img
            src="/books.png"
            alt="Books image"
            className="object-contain"
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const searchSchema = z.object({
  type: z.enum(['isbn', 'title']).catch('isbn'),
  next: z.number().int().min(0).max(1).catch(0),
  bookshelfId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/bookshelf/search/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <Search />
      </RequireAuthComponent>
    );
  },
  validateSearch: (search) => searchSchema.parse(search),
});
