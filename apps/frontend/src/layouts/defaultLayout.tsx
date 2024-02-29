import React, { FC } from 'react';
import { cn } from '../lib/utils';

export interface Props {
  children: React.ReactNode;
  innerContainerClassName?: string;
}

export const DefaultLayout: FC<Props> = ({ children, innerContainerClassName }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className={cn('flex items-center justify-center px-4 h-[600px]', innerContainerClassName)}>
        {children}
      </div>
    </div>
  );
};
