import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { CreateAuthorModal } from '../../../../modules/author/components/createAuthorModal';
import { Button } from '../../../../modules/common/components/button/button';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { AuthorsTable } from '../../../../modules/admin/components/authorsTable';
import { z } from 'zod';

export const AuthorsAdminPage: FC = () => {
  const navigate = useNavigate();

  const searchParams = Route.useSearch();

  const setPage = (page: number) => {
    navigate({
      search: (values) => ({ ...values, page }),
    });
  };

  const setSearchAuthorName = (val: string) => {
    navigate({
      search: (values) => ({ ...values, name: val }),
    });
  };

  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="authors" />}
        TableSlot={
          <AuthorsTable
            authorName={searchParams.name}
            page={searchParams.page}
            setPage={setPage}
            setAuthorName={setSearchAuthorName}
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

const RouteSearchSchema = z.object({
  page: z
    .number({
      coerce: true,
    })
    .catch(1),
  pageSize: z
    .number({
      coerce: true,
    })
    .catch(10),
  name: z.string().catch(''),
});

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
  validateSearch: (s) => RouteSearchSchema.parse(s),
});
