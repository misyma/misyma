import { type FC } from 'react';

import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';
import { CreateBookPageRevamp } from './createBookPageRevamp';

export const SearchBookPage: FC<{ from: string }> = () => {
  return (
    <AuthenticatedLayout>
      <CreateBookPageRevamp />
    </AuthenticatedLayout>
  );
};
