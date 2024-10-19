import { createFileRoute } from '@tanstack/react-router';
import { FC, useState } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { CreateAuthorModal } from '../../../../modules/author/components/createAuthorModal';
import { Button } from '../../../../modules/common/components/button/button';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { AdminAuthorsTable } from '../../../../modules/admin/components/adminAuthorsTable';

export const AuthorsAdminPage: FC = () => {
  const [page, setPage] = useState(1);

  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="authors" />}
        TableSlot={
          <AdminAuthorsTable
            page={page}
            setPage={setPage}
          />
        }
        AdditionalActionsSlot={
          <CreateAuthorModal
            onMutated={() => {}}
            trigger={<Button>Stwórz autora</Button>}
          ></CreateAuthorModal>
        }
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
  staticData: {
    routeDisplayableNameParts: [
      {
        href: '/admin/tabs/authors/',
        readableName: 'Admin',
      },
      {
        href: '/admin/tabs/authors/',
        readableName: 'Autorzy',
      },
    ],
  },
});
