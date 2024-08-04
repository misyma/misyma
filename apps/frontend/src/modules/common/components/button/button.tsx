import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

import styles from './index.module.css';

export const buttonVariantsStylesMap = {
  default: styles['default-button'],
  destructive: styles['destructive-button'],
  outline: styles['outline-button'],
  secondary: styles['secondary-button'],
  ghost: styles['ghost-button'],
  link: styles['link-button'],
} as const;

export const buttonSizesStylesMap = {
  base: styles['base-size'],
  sm: styles['sm-size'],
  lg: styles['lg-size'],
  xl: styles['xl-size'],
  icon: styles['icon-size'],
  custom: ''
} as const;

const getVariantStyles = (variant: ButtonVariant): string => {
  const value = buttonVariantsStylesMap[variant];

  if (!value) {
    throw new Error('Invalid variant provided.');
  }

  return value;
};

const getSizeStyles = (size: ButtonSize): string => {
  const value = buttonSizesStylesMap[size];

  if (!value && value !== '') {
    throw new Error('Invalid size provided.');
  }

  return value;
};

export type ButtonVariant = keyof typeof buttonVariantsStylesMap;

export type ButtonSize = keyof typeof buttonSizesStylesMap;

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Props {
  asChild?: boolean;
  label?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'lg', label, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const variantStyles = getVariantStyles(variant);

    const sizeStyles = getSizeStyles(size);

    if (label && !asChild) {
      return (
        <Comp
          className={cn(className, styles['button'], variantStyles, sizeStyles)}
          ref={ref}
          {...props}
        >
          {label}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(styles['button'], variantStyles, sizeStyles, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
