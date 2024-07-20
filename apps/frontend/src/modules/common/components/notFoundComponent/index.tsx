import { FC } from 'react';
import { Button } from '../button/button';
import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';

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
