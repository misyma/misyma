import { createFileRoute, useSearch } from '@tanstack/react-router';
import { type FC } from 'react';

import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { AuthorsTable } from '../../../../modules/admin/components/authorsTable';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';

export const AuthorsAdminPage: FC = () => {
  const navigate = Route.useNavigate();

  // TODO: What the heck is wrong with this library to throw errors on
  // export being differently named then `Route` :)
  const searchParams = useSearch({ from: Route.fullPath }) as {
    page: number;
    pageSize: number;
    name: string;
  };

  const setPage = (page: number) => {
    navigate({
      to: '',
      search: (values) => ({ ...values, page }),
    });
  };

  const setSearchAuthorName = (val: string) => {
    navigate({
      to: '',
      search: (values) => ({ ...values, name: val }),
    });
  };

  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="authors" />}
        TableSlot={
          <AuthorsTable
            authorName={searchParams?.name}
            page={searchParams?.page}
            setPage={setPage}
            setAuthorName={setSearchAuthorName}
          />
        }
        AdditionalActionsSlot={<></>}
      />
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/admin/tabs/authors/')({
  component: () => {
    return (
      <RequireAdmin>
        <AuthorsAdminPage />
      </RequireAdmin>
    );
  },
});
