import { createLazyFileRoute } from '@tanstack/react-router';
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
        TableSlot={<AdminChangeRequestsTable />}
        AdditionalActionsSlot={<></>}
      />
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/admin/tabs/changeRequests/')({
  component: () => {
    return (
      <RequireAdmin>
        <ChangeRequestsAdminPage />
      </RequireAdmin>
    );
  },
});
