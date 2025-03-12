import { useSearch } from '@tanstack/react-router';
import { type FC } from 'react';

import { AuthenticatedLayout } from '../../auth/layouts/authenticated/authenticatedLayout';
import { CreateBookForm } from '../components/createBookForm/createBookForm';

export const CreateBookPage: FC<{ from: string }> = ({ from }) => {
  const { id } = useSearch({ from }) as { id: string };

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center align-middle">
        <CreateBookForm
          navigateTo="books"
          bookshelfId={id}
        ></CreateBookForm>
      </div>
    </AuthenticatedLayout>
  );
};
