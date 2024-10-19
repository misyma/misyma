import { useMemo, useState } from 'react';
import { ChangeRequestsTable } from '../../bookChangeRequests/components/changeRequestsTable/changeRequestsTable';
import { changeRequestsColumns } from '../../bookChangeRequests/components/changeRequestsTable/changeRequestsTableColumns';
import { useQuery } from '@tanstack/react-query';
import { FindBookChangeRequestsQueryOptions } from '../../bookChangeRequests/api/admin/queries/findBookChangeRequests/findBookChangeRequestsQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';

export const AdminChangeRequestsTable = () => {
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
    })
  );

  const pageCount = useMemo(() => {
    return (
      Math.ceil((changeRequestsData?.metadata?.total ?? 0) / pageSize) || 1
    );
  }, [changeRequestsData?.metadata.total, pageSize]);

  const data = useMemo(() => {
    return changeRequestsData?.data ?? [];
  }, [changeRequestsData?.data]);

  return (
    <ChangeRequestsTable
      data={data}
      columns={changeRequestsColumns}
      pageCount={pageCount}
      onSetPage={setPage}
      pageSize={pageSize}
      pageIndex={page}
      searchTitle={searchTitle}
      setSearchTitle={setSearchTitle}
      itemsCount={changeRequestsData?.metadata.total}
    />
  );
};
