import { FindAdminBooksQueryParams } from '@common/contracts';
import { AdminBookSearchFilter } from '../../book/components/adminBookSearchFilters/adminBookSearchFilters';
import { DynamicFilterValues } from '../../common/contexts/dynamicFilterContext';
import { FC } from 'react';

interface BooksTableAdditionalColumnProps {
  searchParams: FindAdminBooksQueryParams;
  onApplyFilters: (val: DynamicFilterValues) => Promise<void>;
}
export const BooksTableAdditionalColumn: FC<
  BooksTableAdditionalColumnProps
> = ({ onApplyFilters, searchParams }) => {
  return (
    <div className="flex items-center justify-end self-start gap-2 border-l w-full">
      <AdminBookSearchFilter
        initialValues={searchParams as DynamicFilterValues}
        onApplyFilters={onApplyFilters}
      />
    </div>
  );
};
