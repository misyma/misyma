/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { RequireAuthComponent } from '../../../core/components/requireAuth/requireAuthComponent';
import { CreateBookForm } from '../components/createBookForm/createBookForm';
import { rootRoute } from '../../root';
import { BookCreationProvider } from '../components/createBookForm/context/bookCreationContext/bookCreationContext';
import { AuthenticatedLayout } from '../../../layouts/authenticated/authenticatedLayout';

export const CreateBook: FC = () => {
  return (
    <BookCreationProvider>
      <AuthenticatedLayout>
        <div className='flex items-center justify-center align-middle'>
            <CreateBookForm></CreateBookForm>
        </div>
      </AuthenticatedLayout>
    </BookCreationProvider>
  );
};

export const createBookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-book/$id`',
  component: () => {
    return (
      <RequireAuthComponent>
        <CreateBook />
      </RequireAuthComponent>
    );
  },
});
