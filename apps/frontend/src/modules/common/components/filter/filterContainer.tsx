import { FC, ReactNode, useMemo } from 'react';
import { RemoveFilterButton } from './removeFilterButton';
import { FilterComponentProps } from '../../types/filter';
import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';

interface FilterContainerProps extends FilterComponentProps {
  slot: ReactNode;
}
export const FilterContainer: FC<FilterContainerProps> = ({ filter, slot }) => {
  const { filterValues } = useDynamicFilterContext();

  const correspondingFilterValue = filterValues[filter.key as string];

  const correspondingFilterValueExists = useMemo(
    () => !!correspondingFilterValue,
    [correspondingFilterValue]
  );

  return (
    <div className="flex flex-col items-end w-full justify-between gap-1 px-1">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center">
        {correspondingFilterValueExists && (
          <RemoveFilterButton filterKey={filter.key} />
        )}
        {slot}
      </div>
    </div>
  );
};
