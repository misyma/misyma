import { type FC, type PropsWithChildren } from 'react';

import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';

export const ContentLayout: FC<PropsWithChildren<object>> = ({ children }) => {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">{children}</div>
    </AuthenticatedLayout>
  );
};
