import { type FC, type PropsWithChildren } from 'react';

import { type DynamicFilterValues } from '../../contexts/dynamicFilterContext';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';

interface FiltersDrawerProps {
  className?: string;
  actionButtonClassName?: string;
  omitApplyButton?: boolean;
  onApplyFilters: (vals: DynamicFilterValues) => void;
  onClearAll?: () => void;
}

export const FiltersDrawer: FC<
  PropsWithChildren<Omit<FiltersDrawerProps, 'onApplyFilters'> & { onApplyFilters: () => void }>
> = ({ className, actionButtonClassName, omitApplyButton = false, children, onClearAll, onApplyFilters }) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className={cn('gap-4 w-full', className)}>{children}</div>
      <div className={cn('w-full py-4', className, 'flex gap-8 items-center justify-center', actionButtonClassName)}>
        <Button
          variant="none"
          className={cn('text-primary', actionButtonClassName)}
          onClick={onClearAll}
        >
          Wyczyść wszystkie filtry
        </Button>
        {!omitApplyButton && <Button onClick={onApplyFilters}>Aplikuj</Button>}
      </div>
    </div>
  );
};
