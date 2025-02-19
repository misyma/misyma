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
  horizontalLayout?: boolean;
}

export const FilterContainer: FC<FilterContainerProps> = ({
  filter,
  slot,
  filterContainerClassName,
  hasValue,
  disableXButton,
  onRemoveFilter,
  horizontalLayout,
}) => {
  return (
    <div
      className={`flex ${horizontalLayout === true ? 'flex-row items-center' : 'flex-col items-start'} w-full justify-between gap-1 overflow-hidden`}
    >
      <label className={`px-2 ${horizontalLayout === true ? 'flex-grow whitespace-nowrap' : ''}`}>{filter.label}</label>
      <div
        className={cn(
          `relative flex gap-2 items-center justify-start w-full overflow-hidden truncate p-2`,
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
