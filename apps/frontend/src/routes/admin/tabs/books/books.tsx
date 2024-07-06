import { Link, createRoute } from '@tanstack/react-router';
import { FC, useMemo, useState } from 'react';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { rootRoute } from '../../../root';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { BookTable } from '../../../../modules/book/components/bookTable/bookTable';
import { bookTableColumns } from '../../../../modules/book/components/bookTable/bookTableColumns';
import { useFindBooksQuery } from '../../../../modules/book/api/admin/queries/findBooksQuery/findBooksQueryOptions';

export const BooksAdminPage: FC = () => {
  const [page, setPage] = useState(0);

  const [pageSize] = useState(10);

  const [searchTitleName, setSearchTitleName] = useState('');

  const {
    data: booksData,
    // isFetched: isAuthorsFetched,
    // isFetching: isAuthorsFetching,
    // isRefetching: isAuthorsRefetching,
  } = useFindBooksQuery({
    all: true,
    page,
    title: searchTitleName,
  });

  const pageCount = useMemo(() => {
    return Math.ceil((booksData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [booksData?.metadata.total, pageSize]);

  const onNextPage = (): void => {
    setPage(page + 1);
  };

  const onSetPage = (page: number): void => {
    setPage(page);
  };

  const onPreviousPage = (): void => {
    setPage(page - 1);
  };

  const data = useMemo(() => {
    return booksData?.data ?? [];
  }, [booksData?.data]);

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="flex justify-between gap-4 col-span-5">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <Link
                className="cursor-pointer"
                to="/admin/authors"
              >
                Autorzy
              </Link>
              <Link className="cursor-default text-primary font-bold">Książki</Link>
            </ul>
          </div>
          <div className="flex flex-col px-4 col-span-2 sm:col-span-5">
            <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-4">
              <BookTable
                data={data}
                columns={bookTableColumns}
                pageCount={pageCount}
                onNextPage={onNextPage}
                onPreviousPage={onPreviousPage}
                onSetPage={onSetPage}
                pageSize={pageSize}
                pageIndex={page}
                searchBookTitle={searchTitleName}
                setSearchBookTitle={setSearchTitleName}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const booksAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/books',
  component: () => {
    return (
      <RequireAuthComponent>
        <BooksAdminPage />
      </RequireAuthComponent>
    );
  },
});
