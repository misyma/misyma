import { FC, useMemo } from 'react';
import { FilterComponent } from '../filter/filter';
import { Separator } from '../separator/separator';
import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';
import { FilterOpts } from '../../types/filter';
import { cn } from '../../lib/utils';

export const FiltersDrawer: FC<{ className: string }> = ({ className }) => {
  const { filters, filterOptions } = useDynamicFilterContext();

  const constructedFilters = useMemo((): Array<FilterOpts> => {
    return filterOptions.map(
      (filterOption) =>
        ({
          ...filterOption,
          id:
            filterOption.id ||
            `filter-${filters.length + 1}-${String(filterOption.key)}`,
          key: filterOption.key,
          label: filterOption.label,
          type: filterOption.type,
          customSlot: filterOption.customSlot,
        }) as FilterOpts
    );
  }, [filters, filterOptions]);

  return (
    <div className={cn('space-y-4', className)}>
      {constructedFilters.map((filter, idx) => (
        <div key={`container-${filter.id}`} className="grid gap-4">
          <FilterComponent key={filter.id} filter={filter} />
          {idx !== constructedFilters.length - 1 && <Separator></Separator>}
        </div>
      ))}
    </div>
  );
};
