import { useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { type FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { type FindAdminBooksQueryParams } from '@common/contracts';

import { AdminTabs } from '../../../../modules/admin/components/adminTabs';
import { BooksTabActions } from '../../../../modules/admin/components/booksTabActions';
import { BooksTable } from '../../../../modules/admin/components/booksTable';
import { BooksTableFilters } from '../../../../modules/admin/components/booksTableFilters';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { BookApiQueryKeys } from '../../../../modules/book/api/user/queries/bookApiQueryKeys';
import { Input } from '../../../../modules/common/components/input/input';
import { type DynamicFilterValues } from '../../../../modules/common/contexts/dynamicFilterContext';
import useDebounce from '../../../../modules/common/hooks/useDebounce';
import { AdminTabLayout } from '../../../../modules/common/layouts/adminTabLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import {
  adminBookFilterStateActions,
  adminBookFilterStateSelectors,
} from '../../../../modules/core/store/states/adminBookFilterState/adminBookFilterStateSlice';

const TitleInputFilter = () => {
  const navigate = Route.useNavigate();
  const [searchedTitle, setSearchedTitle] = useState(Route.useSearch().title ?? '');

  const debouncedTitle = useDebounce(searchedTitle, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: (prev) => ({
        ...prev,
        page: 1,
        title: debouncedTitle,
      }),
    });
  }, [debouncedTitle, navigate]);

  return (
    <Input
      onChange={(e) => {
        setSearchedTitle(e.target.value);
      }}
      placeholder="Tytuł"
      value={searchedTitle}
    />
  );
};

export const BooksAdminPage: FC = () => {
  const [filterApplied, setFilterApplied] = useState(false);

  const isFilterVisible = useSelector(adminBookFilterStateSelectors.getFilterVisible);

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

    const acceptedFilter = val['isApproved'] as keyof typeof acceptedFilterValueMap;

    const acceptedFilterValue = acceptedFilter ? acceptedFilterValueMap[acceptedFilter] : undefined;

    navigate({
      to: '',
      search: (prev) => ({
        ...prev,
        ...val,
        isApproved: acceptedFilterValue,
        page: 1,
      }),
    });

    setFilterApplied(true);

    if (newSig === '') {
      setFilterApplied(false);

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
      });
    }
  };

  const onClearAll = () => {
    navigate({
      to: '',
      search: (prev) => ({
        page: 1,
        title: prev.title,
      }),
    });

    setFilterApplied(false);
  };

  return (
    <AuthenticatedLayout>
      <AdminTabLayout
        TabsSlot={<AdminTabs currentlySelected="books" />}
        additionalActionsPlacement="beneathTabsSlot"
        AdditionalActionsSlot={
          <div className="flex justify-between items-center w-full col-span-6">
            <TitleInputFilter />
            <BooksTabActions
              filterApplied={filterApplied}
              toggleFilterVisibility={toggleFilterVisibility}
            />
          </div>
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
