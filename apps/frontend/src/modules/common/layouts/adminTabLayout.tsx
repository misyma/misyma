import { FC, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface AdminTabLayoutProps {
  TabsSlot: ReactNode;
  AdditionalActionsSlot: ReactNode;
  TableSlot: ReactNode;
  AdditionalColumn?: ReactNode;
  columnsClassName?: string;
  tableContainerClassName?: string;
  tabsSlotClassName?: string;
  tableWrapperClassName?: string;
  additionalColumnClassName?: string;
  mainWrapperClassName?: string;
}

export const AdminTabLayout: FC<AdminTabLayoutProps> = ({
  TableSlot,
  TabsSlot,
  AdditionalActionsSlot,
  AdditionalColumn,
  columnsClassName,
  tableContainerClassName,
  tabsSlotClassName,
  tableWrapperClassName,
  additionalColumnClassName,
  mainWrapperClassName,
}) => {
  return (
    <div
      className={cn(
        'flex w-full justify-center items-center w-100% px-8 py-2',
        mainWrapperClassName
      )}
    >
      <div
        className={cn(
          'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl',
          columnsClassName
        )}
      >
        <div
          className={cn(
            'flex justify-between gap-4 col-span-full',
            tabsSlotClassName
          )}
        >
          {TabsSlot}
          <div className="flex w-full justify-end">{AdditionalActionsSlot}</div>
        </div>
        <div
          className={cn(
            'flex flex-col px-4 w-[100%] col-span-full',
            tableContainerClassName
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center w-100% px-8 py-1 sm:py-4',
              tableWrapperClassName
            )}
          >
            {TableSlot}
          </div>
        </div>
        {AdditionalColumn && (
          <div className={cn('col-span-1', additionalColumnClassName)}>
            {AdditionalColumn}
          </div>
        )}
      </div>
    </div>
  );
};
