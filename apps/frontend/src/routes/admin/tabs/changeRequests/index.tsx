import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { AdminChangeRequestsTable } from '../../../../modules/admin/components/changeRequestsTable';

export const ChangeRequestsAdminPage: FC = () => {
  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="changeRequests" />}
        TableSlot={
          <AdminChangeRequestsTable />
        }
        AdditionalActionsSlot={<></>}
      />
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/admin/tabs/changeRequests/')({
  component: () => {
    return (
      <RequireAdmin>
        <ChangeRequestsAdminPage />
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
        readableName: 'Prośby o zmianę',
        href: '/admin/tabs/changeRequests/',
      },
    ],
  },
});
