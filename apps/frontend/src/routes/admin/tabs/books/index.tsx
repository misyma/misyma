import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import {
  FilterProvider,
  useFilterContext,
} from '../../../../modules/common/contexts/filterContext';
import { cn } from '../../../../modules/common/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../../../modules/book/api/user/queries/bookApiQueryKeys';
import { z } from 'zod';
import { FindAdminBooksQueryParams } from '@common/contracts';
import { DynamicFilterValues } from '../../../../modules/common/contexts/dynamicFilterContext';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { BooksTable } from '../../../../modules/admin/components/booksTable';
import { BooksTabActions } from '../../../../modules/admin/components/booksTabActions';
import { BooksTableAdditionalColumn } from '../../../../modules/admin/components/booksTableAdditionalColumn';

const TableSizing = {
  visible: `sm:col-span-4 md:col-span-5`,
  invisible: `sm:col-span-5 md:col-span-6`,
} as const;

export const BooksAdminPage: FC = () => {
  const { isFilterVisible, toggleFilterVisibility } = useFilterContext();

  const queryClient = useQueryClient();

  const searchParams = Route.useSearch();

  const navigate = useNavigate();

  const onSetPage = (page: number): void => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  };

  const onApplyFilters = async (val: DynamicFilterValues) => {
    const newSig = Object.values(val).toString();
    navigate({
      search: () => ({ ...val, page: 1 }),
    });

    if (newSig === '') {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="books" />}
        AdditionalActionsSlot={
          <BooksTabActions toggleFilterVisibility={toggleFilterVisibility} />
        }
        TableSlot={
          <BooksTable
            isFilterVisible={isFilterVisible}
            onSetPage={onSetPage}
            params={searchParams as unknown as FindAdminBooksQueryParams}
          />
        }
        AdditionalColumn={
          <BooksTableAdditionalColumn
            onApplyFilters={onApplyFilters}
            searchParams={searchParams as unknown as FindAdminBooksQueryParams}
          />
        }
        columnsClassName="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-4 gap-x-4"
        tableContainerClassName={cn(
          TableSizing[isFilterVisible ? 'visible' : 'invisible'],
          'flex flex-col justify-start px-0 col-span-4 w-full'
        )}
        tabsSlotClassName="flex justify-between gap-4 col-span-6"
        tableWrapperClassName="px-0"
        additionalColumnClassName="flex items-center justify-end self-start gap-2 border-l w-full"
        mainWrapperClassName="px-0"
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
  title: z.string().catch(''),
  authorIds: z.string().catch(''),
  isbn: z.string().catch(''),
  language: z.string().catch(''),
  isApproved: z.boolean().optional(),
  releaseYearAfter: z
    .number({
      coerce: true,
    })
    .int()
    .optional(),
  releaseYearBefore: z
    .number({
      coerce: true,
    })
    .int()
    .optional(),
});

export const Route = createFileRoute('/admin/tabs/books/')({
  component: () => {
    return (
      <RequireAdmin>
        <FilterProvider>
          <BooksAdminPage />
        </FilterProvider>
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
        href: '/admin/tabs/books/',
        readableName: 'Książki',
      },
    ],
  },
  validateSearch: (s) => RouteSearchSchema.parse(s),
});
