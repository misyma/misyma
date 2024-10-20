import { FC, useEffect, useMemo, useState } from 'react';
import { useFindAuthorsQuery } from '../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { authorTableColumns } from '../../author/components/authorTableColumns';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { Author } from '@common/contracts';
import { Input } from '../../common/components/input/input';
import useDebounce from '../../common/hooks/useDebounce';
import { useInitialFetch } from '../../common/hooks/useInitialFetch';
import { DataSkeletonTable } from '../../common/components/dataTable/dataSkeletonTable';

interface AdminAuthorsTableProps {
  page: number;
  setPage: (val: number) => void;
}
export const AuthorsTable: FC<AdminAuthorsTableProps> = ({ page, setPage }) => {
  const [searchAuthorName, setSearchAuthorName] = useState('');
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const debouncedSearchValue = useDebounce(searchAuthorName, 250);

  const onSetSearchAuthorName = (val: string) => {
    setPage(1);
    setSearchAuthorName(val);
  };

  const {
    data: authorsData,
    isFetching,
    isFetched,
  } = useFindAuthorsQuery({
    all: true,
    page,
    name: debouncedSearchValue,
  });

  const { isLoading } = useInitialFetch({ isFetching });

  const data = useMemo(() => {
    return authorsData?.data ?? [];
  }, [authorsData?.data]);

  useEffect(() => {
    if (isFetched) {
      setTotalPages(
        Math.ceil(Number(authorsData?.metadata.total) / Number(pageSize)) || 1
      );
    }
  }, [isFetched, authorsData, pageSize]);

  const itemsCount = useMemo(
    () => authorsData?.metadata.total,
    [authorsData?.metadata.total]
  );

  return (
    <div className="flex flex-col w-full">
      <Input
        placeholder="Wyszukaj autora..."
        value={searchAuthorName ?? ''}
        onChange={(event) => onSetSearchAuthorName(event.target.value)}
        className="max-w-sm"
      />
      {!isLoading && (
        <DataTable<Author, unknown>
          data={data}
          columns={authorTableColumns}
          pageCount={totalPages}
          pageSize={pageSize}
          pageIndex={page}
          itemsCount={authorsData?.metadata.total}
          onSetPage={setPage}
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
          PaginationSlot={totalPages === 0 ? <></> : null}
        />
      )}
    </div>
  );
};
