import { useEffect, useMemo, useState } from 'react';
import { changeRequestsColumns } from '../../bookChangeRequests/components/changeRequestsTable/changeRequestsTableColumns';
import { useQuery } from '@tanstack/react-query';
import { FindBookChangeRequestsQueryOptions } from '../../bookChangeRequests/api/admin/queries/findBookChangeRequests/findBookChangeRequestsQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { DataSkeletonTable } from '../../common/components/dataTable/dataSkeletonTable';
import { useInitialFetch } from '../../common/hooks/useInitialFetch';

export const AdminChangeRequestsTable = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const {
    data: changeRequestsData,
    isFetching,
    isFetched,
  } = useQuery(
    FindBookChangeRequestsQueryOptions({
      accessToken: accessToken as string,
      page,
      pageSize,
    })
  );

  const { isLoading } = useInitialFetch({ isFetching });

  const pageCount = useMemo(() => {
    return (
      Math.ceil((changeRequestsData?.metadata?.total ?? 0) / pageSize) || 1
    );
  }, [changeRequestsData?.metadata.total, pageSize]);

  const data = useMemo(() => {
    return changeRequestsData?.data ?? [];
  }, [changeRequestsData?.data]);

  useEffect(() => {
    if (isFetched) {
      setTotalPages(
        Math.ceil(
          Number(changeRequestsData?.metadata.total) / Number(pageSize)
        ) || 0
      );
    }
  }, [isFetched, changeRequestsData, pageSize]);

  return (
    <div className="flex flex-col w-full">
      {!isLoading && (
        <DataTable
          data={data}
          columns={changeRequestsColumns}
          pageCount={pageCount}
          onSetPage={setPage}
          pageSize={pageSize}
          pageIndex={page}
          PaginationSlot={pageCount === 0 && null}
        />
      )}
      {isLoading && (
        <DataSkeletonTable
          columns={changeRequestsColumns}
          pageCount={pageCount}
          pageSize={pageSize}
          pageIndex={page}
          skeletonHeight={6}
          onSetPage={setPage}
          PaginationSlot={totalPages === 0 ? <></> : null}
        />
      )}
    </div>
  );
};
