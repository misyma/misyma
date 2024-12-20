import { FC, ReactNode } from 'react';
import { FilterComponentProps } from '../../types/filter';
import { cn } from '../../lib/utils';

interface FilterContainerProps
  extends Omit<FilterComponentProps, 'setFilterAction'> {
  slot: ReactNode;
  filterContainerClassName?: string;
}
export const FilterContainer: FC<FilterContainerProps> = ({
  filter,
  slot,
  filterContainerClassName
}) => {
  return (
    <div className="flex flex-col items-start w-full justify-between gap-1 overflow-hidden">
      <label className='px-2'>{filter.label}</label>
      <div className={cn("flex gap-2 items-center justify-start w-full overflow-hidden truncate p-2", filterContainerClassName)}>
        {slot}
      </div>
    </div>
  );
};
