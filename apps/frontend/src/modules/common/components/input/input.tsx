import * as React from 'react';
import { ImQuill } from 'react-icons/im';
import { FaCirclePlus } from 'react-icons/fa6';
import { cn } from '../../lib/utils';

import styles from './index.module.css';

export type InputSize = 'sm' | 'base' | 'lg' | 'xl';

const getInputSizeClass = (size: InputSize): string => {
  const inputSizeMap = {
    sm: styles['small-input'],
    base: styles['base-input'],
    lg: styles['large-input'],
    xl: styles['xlarge-input'],
  } as const;

  const value = inputSizeMap[size];

  if (!value) {
    throw new Error(`Invalid value provided for input size: ${size}.`);
  }

  return value;
};

const getInnerSizeClass = (size: InputSize): string => {
  const inputSizeMap = {
    sm: styles['small-inner'],
    base: styles['base-inner'],
    lg: styles['large-inner'],
    xl: styles['xlarge-inner'],
  } as const;

  const value = inputSizeMap[size];

  if (!value) {
    throw new Error(`Invalid value provided for input size: ${size}.`);
  }

  return value;
};

const getIconSizeClass = (size: InputSize): string => {
  const iconSizeMap = {
    sm: styles['small-icon'],
    base: styles['base-icon'],
    lg: styles['large-icon'],
    xl: styles['xlarge-icon'],
  } as const;

  const value = iconSizeMap[size];

  if (!value) {
    throw new Error(`Invalid value provided for input size: ${size}.`);
  }

  return value;
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  includeQuill?: boolean;
  otherIcon?: React.ReactNode;
  iSize?: InputSize;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, iSize = 'xl', containerClassName, type, includeQuill = true, otherIcon, ...props }, ref) => {
    const sizeClass = getInputSizeClass(iSize);

    const innerSizeClass = getInnerSizeClass(iSize);

    const iconSizeClass = getIconSizeClass(iSize);

    return (
      <div className={cn(styles['input-container'], containerClassName, sizeClass)}>
        <input
          type={type}
          className={cn(styles['input'], 'h-12 px-3 py-2', innerSizeClass, className)}
          ref={ref}
          {...props}
        />
        {includeQuill && (
          <div className={cn(styles['icon-container'], sizeClass)}>
            <ImQuill className={cn(styles['input-icon'], iconSizeClass)} />
          </div>
        )}
        {otherIcon && <div className={cn(styles['icon-container'], sizeClass)}>{otherIcon}</div>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fileName: string;
  containerClassName?: string;
  iSize?: InputSize;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, containerClassName, iSize = 'xl', fileName, type, ...props }, ref) => {
    const sizeClass = getInputSizeClass(iSize);

    const iconSizeClass = getIconSizeClass(iSize);

    return (
      <div
        className={cn(
          `flex
         flex-row
         has-[input:focus-visible]:ring-2
         has-[input:focus-visible]:ring-ring
         has-[input:focus-visible]:ring-offset-4
         bg-[#D1D5DB]/20
         rounded-md
         border
         border-input
         ring-offset-background
         h-12
         w-60 sm:w-96
         relative`,
          containerClassName,
          sizeClass,
        )}
      >
        <input
          type={type}
          className={cn(
            'w-60 sm:w-96 flex h-12 px-3 py-2 rounded-md text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 bg-none bg-[unset] focus:border-none outline-none cursor-pointer',
            sizeClass,
            className,
          )}
          ref={ref}
          {...props}
        />
        <div
          className={cn('w-60 sm:w-96 absolute h-12 px-2 items-center flex justify-between pointer-events-none', sizeClass)}
        >
          <p className="text-sm truncate">{fileName}</p>
          <div className="px-2">
            <FaCirclePlus className={cn('h-6 w-6 text-primary pointer-events-none', iconSizeClass)}></FaCirclePlus>
          </div>
        </div>
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';

export { Input, FileInput };
