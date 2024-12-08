import { FindAdminBooksQueryParams } from '@common/contracts';
import { AdminBookSearchFilter } from '../../book/components/adminBookSearchFilters/adminBookSearchFilters';
import { DynamicFilterValues } from '../../common/contexts/dynamicFilterContext';
import { FC } from 'react';

interface BooksTableAdditionalColumnProps {
  searchParams: FindAdminBooksQueryParams;
  onApplyFilters: (val: DynamicFilterValues) => Promise<void>;
}
export const BooksTableFilters: FC<
  BooksTableAdditionalColumnProps
> = ({ onApplyFilters, searchParams }) => {
  return (
    <div className="px-2">
      <AdminBookSearchFilter
        initialValues={searchParams as DynamicFilterValues}
        onApplyFilters={onApplyFilters}
      />
    </div>
  );
};
