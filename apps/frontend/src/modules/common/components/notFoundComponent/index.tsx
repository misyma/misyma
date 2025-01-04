import { type FC } from 'react';

import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../button/button';

export const NotFoundPage: FC = () => {
  return (
    <AuthenticatedLayout>
      <div id="not-found-page">
        <Button>Click me</Button>
        <h1>Not Found</h1>
      </div>
    </AuthenticatedLayout>
  );
};
