import { FC, useMemo, useState } from 'react';
import { useFindAuthorsQuery } from '../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { authorTableColumns } from '../../author/components/authorTableColumns';
import { DataTable } from '../../common/components/dataTable/dataTable';
import { Author } from '@common/contracts';
import { Input } from '../../common/components/input/input';
import useDebounce from '../../common/hooks/useDebounce';

interface AdminAuthorsTableProps {
  page: number;
  setPage: (val: number) => void;
}
export const AdminAuthorsTable: FC<AdminAuthorsTableProps> = ({
  page,
  setPage,
}) => {
  const [searchAuthorName, setSearchAuthorName] = useState('');
  const [pageSize] = useState(10);
  const debouncedSearchValue = useDebounce(searchAuthorName, 250);

  const onSetSearchAuthorName = (val: string) => {
    setPage(1);
    setSearchAuthorName(val);
  };

  const {
    data: authorsData,
    // isFetched: isAuthorsFetched,
    // isFetching: isAuthorsFetching,
    // isRefetching: isAuthorsRefetching,
  } = useFindAuthorsQuery({
    all: true,
    page,
    name: debouncedSearchValue,
  });

  const data = useMemo(() => {
    return authorsData?.data ?? [];
  }, [authorsData?.data]);

  const pageCount = useMemo(() => {
    return Math.ceil((authorsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [authorsData?.metadata.total, pageSize]);

  return (
    <div className='flex flex-col w-full'>
        <Input
          placeholder="Wyszukaj autora..."
          value={searchAuthorName ?? ''}
          onChange={(event) => onSetSearchAuthorName(event.target.value)}
          className="max-w-sm"
        />
      <DataTable<Author, unknown>
        data={data}
        columns={authorTableColumns}
        pageCount={pageCount}
        pageSize={pageSize}
        pageIndex={page}
        onSetPage={setPage}
      />
    </div>
  );
};
