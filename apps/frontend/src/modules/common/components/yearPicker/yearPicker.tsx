import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select';

export type YearPickerProps = {
  value?: number;
  minYear?: number;
  maxYear?: number;
  className?: string;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onValueChange: (val: string) => void;
};

function YearPicker({
  value,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  className,
  open,
  onOpenChange,
  onValueChange,
}: YearPickerProps) {
  const years = useMemo(() => {
    const items = Array.from({ length: maxYear - minYear + 1 });

    return items.map((_, index) => (
      <SelectItem
        className={cn('w-full sm:w-full', className)}
        key={`year-${minYear + index}`}
        value={`${minYear + index}`}
      >
        {minYear + index}
      </SelectItem>
    ));
  }, [minYear, maxYear, className]);

  return (
    <Select
      value={value?.toString() || ''}
      open={open}
      onOpenChange={onOpenChange}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={cn(className)}>
        {!value && "RRRR"}
        <SelectValue
          className={cn( className)}
        ></SelectValue>
      </SelectTrigger>
      <SelectContent className={cn(className)}>
        {years}
      </SelectContent>
    </Select>
  );
}

YearPicker.displayName = 'YearPicker';

export { YearPicker };
