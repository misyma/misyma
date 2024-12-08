import { FC, useMemo } from 'react';
import { FilterComponent } from '../filter/filter';
import {
  DynamicFilterValues,
  useDynamicFilterContext,
} from '../../contexts/dynamicFilterContext';
import { FilterOpts } from '../../types/filter';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';

export const FiltersDrawer: FC<{
  className?: string;
  actionButtonClassName?: string;
  onApplyFilters: (vals: DynamicFilterValues) => void;
}> = ({ className, actionButtonClassName, onApplyFilters }) => {
  const { filters, filterOptions, filterValues, removeAllFilters } =
    useDynamicFilterContext();

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

  const onRemoveAll = () => {
    removeAllFilters();
    onApplyFilters({});
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('space-y-4 w-full', className)}>
        {constructedFilters.map((filter) => (
          <div
            key={`container-${filter.id}`}
            className="flex items-end justify-center"
          >
            <FilterComponent key={filter.id} filter={filter} />
          </div>
        ))}
      </div>
      <div
        className={cn(
          'w-full py-4',
          className,
          'flex gap-8 items-center justify-center',
          actionButtonClassName
        )}
      >
        <Button
          variant="none"
          className={cn('text-primary', actionButtonClassName)}
          onClick={onRemoveAll}
        >
          Wyczyść wszystkie filtry
        </Button>
        <Button onClick={() => onApplyFilters(filterValues)}>Aplikuj</Button>
      </div>
    </div>
  );
};
