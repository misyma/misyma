import { motion } from 'framer-motion';
import { type FC, type PropsWithChildren, memo } from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { Separator } from '../separator/separator';

interface FiltersDrawerProps {
  className?: string;
  actionButtonClassName?: string;
  omitApplyButton?: boolean;
  showClearButton?: boolean;
  onClearAll: () => void;
  onApplyFilters: () => void;
  open: boolean;
}

const slideAnimation = {
  open: {
    y: 0,
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  closed: {
    y: -20,
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

const DrawerButtons = memo(
  ({
    showClearButton,
    actionButtonClassName,
    onClearAll,
    omitApplyButton,
    onApplyFilters,
  }: Pick<
    FiltersDrawerProps,
    'showClearButton' | 'actionButtonClassName' | 'onClearAll' | 'omitApplyButton' | 'onApplyFilters'
  >) => (
    <div className={cn('w-full pt-4 flex gap-8 items-center justify-center', actionButtonClassName)}>
      <motion.div
        animate={{ opacity: showClearButton ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="none"
          className={cn('text-primary', actionButtonClassName, 'pointer-events-auto')}
          onClick={onClearAll}
          style={{
            pointerEvents: showClearButton ? 'auto' : 'none',
          }}
        >
          Wyczyść wszystkie filtry
        </Button>
      </motion.div>
      {!omitApplyButton && <Button onClick={onApplyFilters}>Aplikuj</Button>}
    </div>
  ),
);

DrawerButtons.displayName = 'DrawerButtons';

export const FiltersDrawer: FC<PropsWithChildren<FiltersDrawerProps>> = memo(
  ({
    className,
    actionButtonClassName,
    omitApplyButton = false,
    showClearButton = true,
    children,
    onClearAll,
    onApplyFilters,
    open,
  }) => {
    return (
      <div className="overflow-hidden">
        <motion.div
          className="grid"
          initial="closed"
          animate={open ? 'open' : 'closed'}
          variants={slideAnimation}
        >
          <Separator />
          <div className="flex flex-col gap-2 p-2 flex-shrink-0">
            <div className={cn('gap-4 w-full', className)}>{children}</div>
            <DrawerButtons
              showClearButton={showClearButton}
              actionButtonClassName={actionButtonClassName}
              onClearAll={onClearAll}
              omitApplyButton={omitApplyButton}
              onApplyFilters={onApplyFilters}
            />
          </div>
          <Separator className="mb-4" />
        </motion.div>
      </div>
    );
  },
);

FiltersDrawer.displayName = 'FiltersDrawer';

export default FiltersDrawer;
