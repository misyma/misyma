import { type FC } from 'react';

import { AdminBookSearchFilter } from '../../book/components/organisms/adminBookSearchFilters/adminBookSearchFilters';
import { type DynamicFilterValues } from '../../common/contexts/dynamicFilterContext';

interface BooksTableAdditionalColumnProps {
  onApplyFilters: (val: DynamicFilterValues) => Promise<void>;
  onClearAll: () => void;
}
export const BooksTableFilters: FC<BooksTableAdditionalColumnProps> = ({ onApplyFilters, onClearAll }) => {
  return (
    <div className="px-2">
      <AdminBookSearchFilter
        onApplyFilters={onApplyFilters}
        onClearAll={onClearAll}
      />
    </div>
  );
};
