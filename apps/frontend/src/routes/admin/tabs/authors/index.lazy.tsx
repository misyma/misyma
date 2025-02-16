import { createFileRoute, useSearch } from '@tanstack/react-router';
import { type FC } from 'react';

import { type FindAuthorsSortField, type SortOrder } from '@common/contracts';

import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { AuthorsTable } from '../../../../modules/admin/components/authorsTable';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';

export const AuthorsAdminPage: FC = () => {
  const navigate = Route.useNavigate();

  const searchParams = useSearch({ from: Route.fullPath }) as {
    page: number;
    pageSize: number;
    name: string;
    sortField?: FindAuthorsSortField;
    sortOrder?: SortOrder;
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
            sortField={searchParams?.sortField}
            sortOrder={searchParams?.sortOrder}
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
