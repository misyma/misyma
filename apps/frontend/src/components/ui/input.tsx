import * as React from 'react';
import { ImQuill } from 'react-icons/im';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  includeQuill?: boolean;
  otherIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, includeQuill = true, ...props }, ref) => {
    return (
      <div className="flex flex-row">
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#D1D5DB]/20',
            className,
          )}
          ref={ref}
          {...props}
        />
        {includeQuill && (
          <div className="w-60 sm:w-96 absolute h-12 pointer-events-none flex items-center justify-end px-2">
            <ImQuill className="text-primary opacity-65 text-3xl" />
          </div>
        )}
        {props.otherIcon && (
          <div className="w-60 sm:w-96 absolute h-12 pointer-events-none flex items-center justify-end px-2">
            {props.otherIcon}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
