import { FC, useMemo, useState } from 'react';
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
  const debouncedSearchValue = useDebounce(searchAuthorName, 250);

  const onSetSearchAuthorName = (val: string) => {
    setPage(1);
    setSearchAuthorName(val);
  };

  const { data: authorsData, isFetching } = useFindAuthorsQuery({
    all: true,
    page,
    name: debouncedSearchValue,
  });

  const { isLoading } = useInitialFetch({ isFetching });

  const data = useMemo(() => {
    return authorsData?.data ?? [];
  }, [authorsData?.data]);

  const pageCount = useMemo(() => {
    return Math.ceil((authorsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [authorsData?.metadata.total, pageSize]);

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
          pageCount={pageCount}
          pageSize={pageSize}
          pageIndex={page}
          onSetPage={setPage}
        />
      )}
      {isLoading && (
        <DataSkeletonTable
          columns={authorTableColumns}
          pageCount={pageCount}
          pageSize={pageSize}
          pageIndex={page}
          skeletonHeight={14}
          onSetPage={setPage}
        />
      )}
    </div>
  );
};
