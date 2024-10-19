import { FC, ReactNode } from 'react';

interface AdminTabLayoutProps {
  TabsSlot: ReactNode;
  AdditionalActionsSlot: ReactNode;
  TableSlot: ReactNode;
}

export const AdminTabLayout: FC<AdminTabLayoutProps> = ({
  TableSlot,
  TabsSlot,
  AdditionalActionsSlot
}) => {
  return (
    <div className="flex w-full justify-center items-center w-100% px-8 py-2">
      <div className="grid grid-cols-4 sm:grid-cols-5 w-full gap-y-4 gap-x-4 sm:max-w-screen-2xl">
        <div className="flex justify-between gap-4 col-span-5">
          {TabsSlot}
          <div className="flex w-full justify-end">
            {AdditionalActionsSlot}
          </div>
        </div>
        <div className="flex flex-col px-4 col-span-2 sm:col-span-5">
          <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-4">
            {TableSlot}
          </div>
        </div>
      </div>
    </div>
  );
};
