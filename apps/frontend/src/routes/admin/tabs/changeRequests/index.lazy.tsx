import { createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';

import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { AdminChangeRequestsTable } from '../../../../modules/admin/components/changeRequestsTable';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';

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
