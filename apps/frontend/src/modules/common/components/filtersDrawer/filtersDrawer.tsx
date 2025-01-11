import { motion } from 'framer-motion';
import { type FC, type PropsWithChildren } from 'react';

import { type DynamicFilterValues } from '../../contexts/dynamicFilterContext';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { Separator } from '../separator/separator';
interface FiltersDrawerProps {
  className?: string;
  actionButtonClassName?: string;
  omitApplyButton?: boolean;
  onApplyFilters: (vals: DynamicFilterValues) => void;
  onClearAll?: () => void;
  showClearButton?: boolean;
}

export const FiltersDrawer: FC<
  PropsWithChildren<Omit<FiltersDrawerProps, 'onApplyFilters'> & { onApplyFilters: () => void }>
> = ({
  className,
  actionButtonClassName,
  omitApplyButton = false,
  showClearButton = true,
  children,
  onClearAll,
  onApplyFilters,
}) => {
  const slideAnimation = {
    initial: {
      y: -20,
      opacity: 0,
      height: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <motion.div
      className="grid overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideAnimation}
    >
      <Separator />
      <motion.div className="flex flex-col gap-2 p-2 flex-shrink-0">
        <div className={cn('gap-4 w-full', className)}>{children}</div>
        <div className={cn('w-full pt-4', className, 'flex gap-8 items-center justify-center', actionButtonClassName)}>
          <Button
            variant="none"
            className={cn(
              'text-primary',
              actionButtonClassName,
              showClearButton ? 'visible' : 'invisible pointer-events-none',
            )}
            onClick={onClearAll}
          >
            Wyczyść wszystkie filtry
          </Button>
          {!omitApplyButton && <Button onClick={onApplyFilters}>Aplikuj</Button>}
        </div>
      </motion.div>
      <Separator className="mb-4" />
    </motion.div>
  );
};
