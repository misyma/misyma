import { Link, createFileRoute } from '@tanstack/react-router';
import { FC, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { ChangeRequestsTable } from '../../../../modules/bookChangeRequests/components/changeRequestsTable/changeRequestsTable';
import { changeRequestsColumns } from '../../../../modules/bookChangeRequests/components/changeRequestsTable/changeRequestsTableColumns';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { FindBookChangeRequestsQueryOptions } from '../../../../modules/bookChangeRequests/api/admin/queries/findBookChangeRequests/findBookChangeRequestsQueryOptions';

export const ChangeRequestsAdminPage: FC = () => {
  const [page, setPage] = useState(1);

  const [pageSize] = useState(10);

  const [searchTitle, setSearchTitle] = useState('');

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const {
    data: changeRequestsData,
    // isFetched: isAuthorsFetched,
    // isFetching: isAuthorsFetching,
    // isRefetching: isAuthorsRefetching,
  } = useQuery(
    FindBookChangeRequestsQueryOptions({
      accessToken: accessToken as string,
      page,
      pageSize,
    }),
  );

  const pageCount = useMemo(() => {
    return Math.ceil((changeRequestsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [changeRequestsData?.metadata.total, pageSize]);

  const onSetPage = (page: number): void => {
    setPage(page);
  };

  const data = useMemo(() => {
    return changeRequestsData?.data ?? [];
  }, [changeRequestsData?.data]);

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl">
          <div className="flex justify-between gap-4 col-span-5">
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold min-w-96">
              <Link
                className="cursor-pointer"
                to="/admin/tabs/authors"
              >
                Autorzy
              </Link>
              <Link
                to="/admin/tabs/books"
                className="cursor-pointer"
              >
                Książki
              </Link>
              <Link className="cursor-default text-primary font-bold">Prośby o zmianę</Link>
            </ul>
          </div>
          <div className="flex flex-col px-4 col-span-2 sm:col-span-5">
            <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-4">
              <ChangeRequestsTable
                data={data}
                columns={changeRequestsColumns}
                pageCount={pageCount}
                onSetPage={onSetPage}
                pageSize={pageSize}
                pageIndex={page}
                searchTitle={searchTitle}
                setSearchTitle={setSearchTitle}
                itemsCount={changeRequestsData?.metadata.total}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/admin/tabs/changeRequests/')({
  component: () => {
    return (
      <RequireAdmin>
        <ChangeRequestsAdminPage />
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
        readableName: 'Prośby o zmianę',
        href: '/admin/tabs/changeRequests/',
      },
    ],
  },
});
