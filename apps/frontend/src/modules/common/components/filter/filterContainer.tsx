import { FC, ReactNode } from 'react';
import { FilterComponentProps } from '../../types/filter';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { X } from 'lucide-react';

interface FilterContainerProps
  extends Omit<FilterComponentProps, 'setFilterAction'> {
  slot: ReactNode;
  filterContainerClassName?: string;
  onRemoveFilter?: () => void;
  hasValue?: boolean;
}
export const FilterContainer: FC<FilterContainerProps> = ({
  filter,
  slot,
  filterContainerClassName,
  hasValue,
  onRemoveFilter,
}) => {
  return (
    <div className="flex flex-col items-start w-full justify-between gap-1 overflow-hidden">
      <label className="px-2">{filter.label}</label>
      <div
        className={cn(
          'relative flex gap-2 items-center justify-start w-full overflow-hidden truncate p-2',
          filterContainerClassName
        )}
      >
        {slot}
        {hasValue && onRemoveFilter && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent p-0 h-auto"
            onClick={onRemoveFilter}
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};
