/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../../root';
import { RequireAuthComponent } from '../../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { ChoosePathStep } from './components/pathChoice/pathChoice';
import { IsbnPathForm } from './components/byIbsn/isbnPathForm';
import { AuthenticatedLayout } from '../../../layouts/authenticated/authenticatedLayout';
import { ByTitleForm } from './components/byTitle/byTitle';

export const Search = () => {
  const searchParams = searchRoute.useSearch();

  const render = () => {
    if (searchParams.next === 0) {
      return <ChoosePathStep initialValue={searchParams.type} />;
    }

    if (searchParams.type === 'isbn') {
      return <IsbnPathForm />;
    }

    return <ByTitleForm />; //title :)
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
  bookshelfId: z.string().uuid().catch(''), // todo
});

export const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: () => {
    return (
      <RequireAuthComponent>
        <Search />
      </RequireAuthComponent>
    );
  },
  validateSearch: (search) => searchSchema.parse(search),
});
