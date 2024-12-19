import { FC, ReactNode, useMemo } from 'react';
import { RemoveFilterButton } from './removeFilterButton';
import { FilterComponentProps } from '../../types/filter';
import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';

interface FilterContainerProps extends FilterComponentProps {
  slot: ReactNode;
}
export const FilterContainer: FC<FilterContainerProps> = ({
  filter,
  slot,
  onRemoveFilter,
}) => {
  const { filterValues } = useDynamicFilterContext();

  const correspondingFilterValue = filterValues[filter.key as string];

  const correspondingFilterValueExists = useMemo(() => {
    if (correspondingFilterValue == null) {
      return false;
    }
    if (correspondingFilterValue === '') {
      return false;
    }
    return true;
  }, [correspondingFilterValue]);

  return (
    <div className="flex flex-col items-start w-full justify-between gap-1 px-1 overflow-hidden">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center justify-start w-full overflow-hidden truncate">
        {slot}
        {correspondingFilterValueExists && (
          <RemoveFilterButton
            onRemoveFilter={onRemoveFilter}
            filterKey={filter.key}
          />
        )}
      </div>
    </div>
  );
};
