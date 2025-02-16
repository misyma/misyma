import { type FC, useEffect, useMemo, useState } from 'react';

import { type FindAuthorsSortField, type Author, type SortOrder } from '@common/contracts';

import { AdminAuthorsSortButton } from './adminAuthorsSortButton';
import { useFindAdminAuthorsQuery } from '../../author/api/admin/queries/findAdminAuthorsQuery/findAdminAuthorsQuery';
import { authorTableColumns } from '../../author/components/authorTableColumns';
import { CreateAuthorModal } from '../../author/components/createAuthorModal';
import { DataSkeletonTable } from '../../common/components/dataTable/dataSkeletonTable';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { Input } from '../../common/components/input/input';
import useDebounce from '../../common/hooks/useDebounce';
import { useInitialFetch } from '../../common/hooks/useInitialFetch';

interface AdminAuthorsTableProps {
  page: number;
  sortField?: FindAuthorsSortField;
  sortOrder?: SortOrder;
  setPage: (val: number) => void;
  authorName: string;
  setAuthorName: (val: string) => void;
}

export const AuthorsTable: FC<AdminAuthorsTableProps> = ({
  page,
  setPage,
  setAuthorName,
  authorName,
  sortField,
  sortOrder,
}) => {
  const [searchAuthorName, setSearchAuthorName] = useState(authorName);

  const [pageSize] = useState(10);

  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearchValue = useDebounce(searchAuthorName, 250);

  const onSetSearchAuthorName = (val: string) => {
    setPage(1);

    setSearchAuthorName(val);
  };

  useEffect(() => {
    setAuthorName(debouncedSearchValue);
  }, [debouncedSearchValue, setAuthorName]);

  const {
    data: authorsData,
    isFetching,
    isFetched,
  } = useFindAdminAuthorsQuery({
    all: true,
    page,
    name: debouncedSearchValue,
    sortField,
    sortOrder,
  });

  const { isLoading } = useInitialFetch({ isFetching });

  const data = useMemo(() => {
    return authorsData?.data ?? [];
  }, [authorsData?.data]);

  useEffect(() => {
    if (isFetched) {
      setTotalPages(Math.ceil(Number(authorsData?.metadata.total) / Number(pageSize)) || 1);
    }
  }, [isFetched, authorsData, pageSize]);

  const itemsCount = useMemo(() => Number(authorsData?.metadata.total ?? 0), [authorsData?.metadata.total]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-5">
        <Input
          placeholder="Wyszukaj autora..."
          value={searchAuthorName ?? ''}
          onChange={(event) => onSetSearchAuthorName(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 items-center">
          <CreateAuthorModal onMutated={() => {}}></CreateAuthorModal>
          <AdminAuthorsSortButton />
        </div>
      </div>

      {!isLoading && (
        <DataTable<Author, unknown>
          data={data}
          columns={authorTableColumns}
          pageCount={totalPages}
          pageSize={pageSize}
          pageIndex={page}
          itemsCount={authorsData?.metadata.total}
          onSetPage={setPage}
          PaginationSlot={itemsCount <= pageSize ? <></> : null}
        />
      )}
      {isLoading && (
        <DataSkeletonTable
          columns={authorTableColumns}
          pageCount={totalPages}
          pageSize={pageSize}
          pageIndex={page}
          skeletonHeight={6}
          onSetPage={setPage}
          itemsCount={itemsCount}
          PaginationSlot={itemsCount <= pageSize ? <></> : null}
        />
      )}
    </div>
  );
};
