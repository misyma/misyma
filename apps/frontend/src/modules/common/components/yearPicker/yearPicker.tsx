import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button, buttonVariantsStylesMap } from '../button/button';
import buttonStyles from '../button/index.module.css';

export type YearPickerProps = {
  onChange: (year: number) => void;
  value?: number;
  minYear?: number;
  maxYear?: number;
  className?: string;
};

function YearPicker({
  onChange,
  value,
  minYear = 1850,
  maxYear = new Date().getFullYear(),
  className,
}: YearPickerProps) {
  const currentYear = value || new Date().getFullYear();

  const years = useMemo(
    () =>
      Array.from(
        { length: maxYear - minYear + 1 },
        (_, index) => minYear + index
      ),
    [maxYear, minYear]
  );

  const handleYearChange = (year: number) => {
    onChange(year);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
        {years.map((year) => (
          <Button
            size="base"
            key={year}
            variant='default'
            className={cn(
              buttonStyles['button'],
              buttonVariantsStylesMap['ghost'],
              'w-full justify-start',
              year === currentYear && 'bg-accent text-accent-foreground'
            )}
            onClick={() => handleYearChange(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}

YearPicker.displayName = 'YearPicker';

export { YearPicker };
