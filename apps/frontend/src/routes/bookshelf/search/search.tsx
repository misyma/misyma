/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../../root';
import { RequireAuthComponent } from '../../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { ChoosePathStep } from './pathChoice/pathChoice';
import { IsbnPathForm } from './pathChoice/isbnPathForm';
import { AuthenticatedLayout } from '../../../layouts/authenticated/authenticatedLayout';

export const Search = () => {
  const searchParams = searchRoute.useSearch();

  const render = () => {
    if (searchParams.next === 0) {
      return <ChoosePathStep initialValue={searchParams.type} />;
    }

    if (searchParams.type === 'isbn') {
      return <IsbnPathForm />;
    }

    return <></>; //title :)
  };

  return (
    <AuthenticatedLayout>
      <div className="flex justify-center items-center">{render()}</div>
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
