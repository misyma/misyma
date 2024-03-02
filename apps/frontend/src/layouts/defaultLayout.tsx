import React, { FC } from 'react';
import { cn } from '../lib/utils';
import { Link } from '@tanstack/react-router';

export interface Props {
  children: React.ReactNode;
  innerContainerClassName?: string;
}

export const DefaultLayout: FC<Props> = ({ children, innerContainerClassName }) => {
  return (
    <div>
      <div className="p-8 top-0 left-0 absolute w-[100%] font-semibig-clamped font-logo-bold">
        <Link to="/">MISYMA</Link>
      </div>
      <div className="flex items-center justify-center h-screen">
        <div className={cn('flex items-center justify-center px-4 h-[800px]', innerContainerClassName)}>{children}</div>
      </div>
    </div>
  );
};
