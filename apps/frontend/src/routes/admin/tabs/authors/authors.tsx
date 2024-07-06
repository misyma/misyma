import { Link, createRoute } from '@tanstack/react-router';
import { FC, useMemo, useState } from 'react';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { rootRoute } from '../../../root';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { AuthorTable } from '../../../../modules/author/components/authorTable/authorTable';
import { columns } from '../../../../modules/author/components/authorTable/authorTableColumns';
import { useFindAuthorsQuery } from '../../../../modules/author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { AddAuthorModal } from '../../../../modules/author/components/addAuthorModal/addAuthorModal';
import { Button } from '../../../../modules/common/components/ui/button';

export const AuthorsAdminPage: FC = () => {
  const [page, setPage] = useState(0);

  const [pageSize] = useState(10);

  const [searchAuthorName, setSearchAuthorName] = useState('');

  const {
    data: authorsData,
    // isFetched: isAuthorsFetched,
    // isFetching: isAuthorsFetching,
    // isRefetching: isAuthorsRefetching,
  } = useFindAuthorsQuery({
    all: true,
    page,
    name: searchAuthorName,
  });

  const pageCount = useMemo(() => {
    return Math.ceil((authorsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [authorsData?.metadata.total, pageSize]);

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
    return authorsData?.data ?? [];
  }, [authorsData?.data]);

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl">
          <div className="flex justify-between gap-4 col-span-5">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <Link className="cursor-default text-primary font-bold">Autorzy</Link>
              <Link
                to="/admin/books"
                className="cursor-pointer"
              >
                Książki
              </Link>
            </ul>
            <div className="flex w-full justify-end">
              <AddAuthorModal
                onMutated={() => {}}
                trigger={<Button>Stwórz autora</Button>}
              ></AddAuthorModal>
            </div>
          </div>
          <div className="flex flex-col px-4 col-span-2 sm:col-span-5">
            <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-4">
              <AuthorTable
                data={data}
                columns={columns}
                pageCount={pageCount}
                onNextPage={onNextPage}
                onPreviousPage={onPreviousPage}
                onSetPage={onSetPage}
                pageSize={pageSize}
                pageIndex={page}
                searchAuthorName={searchAuthorName}
                setSearchAuthorName={setSearchAuthorName}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const authorsAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/authors',
  component: () => {
    return (
      <RequireAuthComponent>
        <AuthorsAdminPage />
      </RequireAuthComponent>
    );
  },
});
