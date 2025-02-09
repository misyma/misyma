import { X } from 'lucide-react';
import { type FC, type ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { type FilterComponentProps } from '../../types/filter';
import { Button } from '../button/button';

interface FilterContainerProps extends Omit<FilterComponentProps, 'setFilterAction'> {
  slot: ReactNode;
  filterContainerClassName?: string;
  onRemoveFilter?: () => void;
  hasValue?: boolean;
  disableXButton?: boolean;
}
export const FilterContainer: FC<FilterContainerProps> = ({
  filter,
  slot,
  filterContainerClassName,
  hasValue,
  disableXButton,
  onRemoveFilter,
}) => {
  return (
    <div className="flex flex-col items-start w-full justify-between gap-1 overflow-hidden">
      <label className="px-2">{filter.label}</label>
      <div
        className={cn(
          'relative flex gap-2 items-center justify-start w-full overflow-hidden truncate p-2',
          filterContainerClassName,
        )}
      >
        {slot}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hover:bg-transparent h-auto invisible',
            hasValue && onRemoveFilter && !disableXButton && 'visible',
          )}
          onClick={onRemoveFilter}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
