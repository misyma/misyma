import { Link } from '@tanstack/react-router';
import React, { type FC } from 'react';

import { Toaster } from '../../../common/components/toast/toaster';
import { cn } from '../../../common/lib/utils';

export interface Props {
  children: React.ReactNode;
  innerContainerClassName?: string;
}

export const DefaultLayout: FC<Props> = ({ children, innerContainerClassName }) => {
  return (
    <div>
      <div className="p-3 top-0 left-0 absolute w-[100%] text-3xl font-bold">
        <Link to="/">MISYMA</Link>
      </div>
      <div className="flex items-center justify-center h-screen pt-[24rem] sm:pt-[5rem]">
        <div className={cn('flex items-center justify-center px-4 h-[800px]', innerContainerClassName)}>{children}</div>
      </div>
      <Toaster />
    </div>
  );
};
