import { Link, createFileRoute } from '@tanstack/react-router';
import { FC, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { AuthorTable } from '../../../../modules/author/components/authorTable/authorTable';
import { columns } from '../../../../modules/author/components/authorTable/authorTableColumns';
import { useFindAuthorsQuery } from '../../../../modules/author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { AddAuthorModal } from '../../../../modules/author/components/addAuthorModal/addAuthorModal';
import { Button } from '../../../../modules/common/components/button/button';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';

export const AuthorsAdminPage: FC = () => {
  const [page, setPage] = useState(1);

  const [pageSize] = useState(10);

  const [searchAuthorName, setSearchAuthorName] = useState('');

  const onSetSearchAuthorName = (val: string) => {
    setPage(0);

    setSearchAuthorName(val);
  }

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

  const onSetPage = (page: number): void => {
    setPage(page);
  };

  const data = useMemo(() => {
    return authorsData?.data ?? [];
  }, [authorsData?.data]);

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl">
          <div className="flex justify-between gap-4 col-span-5">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold min-w-96">
              <Link className="cursor-default text-primary font-bold">Autorzy</Link>
              <Link
                to="/admin/tabs/books"
                className="cursor-pointer"
              >
                Książki
              </Link>
              <Link
                to="/admin/tabs/changeRequests"
                className="cursor-pointer"
              >
                Prośby o zmianę
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
                onSetPage={onSetPage}
                pageSize={pageSize}
                pageIndex={page}
                searchAuthorName={searchAuthorName}
                setSearchAuthorName={onSetSearchAuthorName}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

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
});
