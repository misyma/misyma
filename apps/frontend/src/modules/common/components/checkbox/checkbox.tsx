import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

import styles from './index.module.css';

type CheckboxSize = 'base' | 'lg' | 'xl' | 'xxl' | 'xxxl';

const getSizeClass = (size: CheckboxSize): string => {
  const sizeMap = {
    ['base']: styles['base-checkbox'],
    ['lg']: styles['large-checkbox'],
    ['xl']: styles['xlarge-checkbox'],
    ['xxl']: styles['xxlarge-checkbox'],
    ['xxxl']: styles['xxxlarge-checkbox'],
  } as const;

  const value = sizeMap[size];

  if (!value) {
    throw new Error(`Value: ${size} does not exist for Checkbox.`);
  }

  return value;
};

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: CheckboxSize;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size = 'base', ...props }, ref) => {
    const sizeClass = getSizeClass(size);

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          sizeClass,
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn(styles['checkbox-indicator-container'], sizeClass)}>
          <Check className={cn(sizeClass)} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
