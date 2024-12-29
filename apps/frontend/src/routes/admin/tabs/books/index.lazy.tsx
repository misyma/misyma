import { createLazyFileRoute } from '@tanstack/react-router';
import { FC, useState } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../../../modules/book/api/user/queries/bookApiQueryKeys';
import { FindAdminBooksQueryParams } from '@common/contracts';
import { DynamicFilterValues } from '../../../../modules/common/contexts/dynamicFilterContext';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { BooksTable } from '../../../../modules/admin/components/booksTable';
import { BooksTabActions } from '../../../../modules/admin/components/booksTabActions';
import { BooksTableFilters } from '../../../../modules/admin/components/booksTableFilters';
import { useDispatch, useSelector } from 'react-redux';
import {
  adminBookFilterStateActions,
  adminBookFilterStateSelectors,
} from '../../../../modules/core/store/states/adminBookFilterState/adminBookFilterStateSlice';

export const BooksAdminPage: FC = () => {
  const [filterApplied, setFilterApplied] = useState(false);
  const isFilterVisible = useSelector(
    adminBookFilterStateSelectors.getFilterVisible
  );
  const dispatch = useDispatch();

  const toggleFilterVisibility = () => {
    dispatch(adminBookFilterStateActions.setFilterVisible(!isFilterVisible));
  };

  const queryClient = useQueryClient();

  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const onSetPage = (page: number): void => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, page }),
    });
  };

  const onApplyFilters = async (val: DynamicFilterValues) => {
    const newSig = Object.values(val).toString();

    const acceptedFilterValueMap = {
      Zaakceptowana: true,
      Niezaakceptowana: false,
      '': undefined,
    };

    const acceptedFilter = val[
      'isApproved'
    ] as keyof typeof acceptedFilterValueMap;
    const acceptedFilterValue = acceptedFilter
      ? acceptedFilterValueMap[acceptedFilter]
      : undefined;

    navigate({
      to: '',
      search: () => ({
        ...val,
        isApproved: acceptedFilterValue,
        page: 1,
      }),
    });

    setFilterApplied(true);

    if (newSig === '') {
      setFilterApplied(false);
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
      });
    }
  };

  const onClearAll = () => {
    navigate({
      to: '',
      search: () => ({}),
    });
    setFilterApplied(false);
  };

  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="books" />}
        AdditionalActionsSlot={
          <BooksTabActions
            filterApplied={filterApplied}
            toggleFilterVisibility={toggleFilterVisibility}
          />
        }
        TableSlot={
          <BooksTable
            isFilterVisible={!!isFilterVisible}
            onSetPage={onSetPage}
            params={
              searchParams as unknown as FindAdminBooksQueryParams & {
                sort: string;
              }
            }
          />
        }
        AdditionalColumn={
          <BooksTableFilters
            onApplyFilters={onApplyFilters}
            onClearAll={onClearAll}
            searchParams={
              searchParams as unknown as FindAdminBooksQueryParams & {
                sort: string;
              }
            }
          />
        }
        columnsClassName="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-4 gap-x-4"
        tabsSlotClassName="flex justify-between gap-4 col-span-6"
        additionalColumnClassName="col-span-6"
      />
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/admin/tabs/books/')({
  component: () => {
    return (
      <RequireAdmin>
        <BooksAdminPage />
      </RequireAdmin>
    );
  },
});
