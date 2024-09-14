import { Link, createFileRoute } from '@tanstack/react-router';
import { FC, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { BookTable } from '../../../../modules/book/components/bookTable/bookTable';
import { bookTableColumns } from '../../../../modules/book/components/bookTable/bookTableColumns';
import { useFindBooksQuery } from '../../../../modules/book/api/admin/queries/findBooksQuery/findBooksQueryOptions';
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

export const BooksAdminPage: FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTitleName, setSearchTitleName] = useState('');
  const { isFilterVisible, toggleFilterVisibility } = useFilterContext();

  const onSetSearchTitle = (val: string) => {
    setPage(1);
    setSearchTitleName(val);
  };

  const { data: booksData, isFetched: isBooksFetched } = useFindBooksQuery({
    all: true,
    page,
    pageSize,
    title: searchTitleName,
  });

  if (isBooksFetched && page !== (booksData?.metadata.page as number)) {
    setPage(booksData?.metadata.page as number);
  }

  const pageCount = useMemo(() => {
    return Math.ceil((booksData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [booksData?.metadata.total, pageSize]);

  const onSetPage = (page: number): void => {
    setPage(page);
  };

  const data = useMemo(() => {
    return booksData?.data ?? [];
  }, [booksData?.data]);

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-2">
        <div className="grid grid-cols-5 sm:grid-cols-6 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl">
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
            className={`flex flex-col justify-center px-8 col-span-2 sm:col-span-${isFilterVisible ? '5' : '6'}`}
          >
            <div className="flex items-center justify-start w-100% py-1 sm:py-4">
              <BookTable
                data={data}
                columns={bookTableColumns}
                pageCount={pageCount}
                onSetPage={onSetPage}
                pageSize={pageSize}
                pageIndex={page}
                searchBookTitle={searchTitleName}
                setSearchBookTitle={onSetSearchTitle}
                itemsCount={booksData?.metadata.total}
              />
            </div>
          </div>{' '}
          <div className="flex items-center justify-end gap-2">
            <AdminBookSearchFilter />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

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
});
