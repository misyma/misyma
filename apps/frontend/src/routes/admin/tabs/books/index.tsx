import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { BookTable } from '../../../../modules/book/components/bookTable/bookTable';
import { bookTableColumns } from '../../../../modules/book/components/bookTable/bookTableColumns';
import { useAdminFindBooksQuery } from '../../../../modules/book/api/admin/queries/findBooksQuery/findBooksQueryOptions';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { BookCreationProvider } from '../../../../modules/bookshelf/context/bookCreationContext/bookCreationContext';
import { CreateBookModal } from '../../../../modules/book/components/createBookModal/createBookModal';
import { AdminBookSearchFilter } from '../../../../modules/book/components/adminBookSearchFilters/adminBookSearchFilters';
import {
  FilterProvider,
  useFilterContext,
} from '../../../../modules/common/contexts/filterContext';
import { Button } from '../../../../modules/common/components/button/button';
import { HiOutlineFilter } from 'react-icons/hi';
import { cn } from '../../../../modules/common/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../../../modules/book/api/user/queries/bookApiQueryKeys';
import { z } from 'zod';
import { FindAdminBooksQueryParams } from '@common/contracts';
import { DynamicFilterValues } from '../../../../modules/common/contexts/dynamicFilterContext';

const TableSizing = {
  visible: `sm:col-span-4 md:col-span-5`,
  invisible: `sm:col-span-5 md:col-span-6`,
} as const;

export const BooksAdminPage: FC = () => {
  const [pageSize] = useState(10);
  const { isFilterVisible, toggleFilterVisibility } = useFilterContext();

  const queryClient = useQueryClient();

  const searchParams = Route.useSearch();

  const navigate = useNavigate();

  const { data: booksData } = useAdminFindBooksQuery({
    all: true,
    ...(searchParams as unknown as FindAdminBooksQueryParams),
  });

  const pageCount = useMemo(() => {
    return Math.ceil((booksData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [booksData?.metadata.total, pageSize]);

  const onSetPage = (page: number): void => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  };

  const data = useMemo(() => {
    return booksData?.data ?? [];
  }, [booksData?.data]);

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
      <div className="flex w-full justify-center items-center w-100% px-8 py-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl">
          <div className="flex justify-between gap-4 col-span-6">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold min-w-96">
              <Link className="cursor-pointer" to="/admin/tabs/authors">
                Autorzy
              </Link>
              <Link className="cursor-default text-primary font-bold">
                Książki
              </Link>
              <Link to="/admin/tabs/changeRequests" className="cursor-pointer">
                Prośby o zmianę
              </Link>
            </ul>
            <div className="flex w-full justify-end"></div>
            <BookCreationProvider>
              <CreateBookModal />
            </BookCreationProvider>
            <Button size="big-icon" onClick={toggleFilterVisibility}>
              <HiOutlineFilter className="w-8 h-8"></HiOutlineFilter>
            </Button>
          </div>
          <div
            className={cn(
              `flex flex-col justify-start px-8 col-span-4`,
              TableSizing[isFilterVisible ? 'visible' : 'invisible']
            )}
          >
            <div className="flex items-center justify-start w-100% py-1 sm:py-4">
              <BookTable
                data={data}
                columns={bookTableColumns}
                pageCount={pageCount}
                onSetPage={onSetPage}
                pageSize={searchParams.pageSize}
                pageIndex={searchParams.page}
                itemsCount={booksData?.metadata.total}
              />
            </div>
          </div>{' '}
          <div className="flex items-center justify-end self-start gap-2 border-l w-full">
            <AdminBookSearchFilter
              initialValues={searchParams}
              onApplyFilters={onApplyFilters}
            />
          </div>
        </div>
      </div>
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
