import { type VariantProps } from 'class-variance-authority';
import { type FC, type PropsWithChildren } from 'react';

import { AuthorBadge } from './authorBadge';
import { type AuthorMultiComboboxOption } from './authorMultiComboboxOption';
import { type multiSelectVariants } from './authorMultiComboboxVariants';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import { cn } from '../../../../common/lib/utils';

interface TruncatedAuthorsTooltip extends VariantProps<typeof multiSelectVariants> {
  values: AuthorMultiComboboxOption[];
  onRemoveValue: (val: AuthorMultiComboboxOption) => void;
  animation: number;
  isAnimating: boolean;
}
export const TruncatedAuthorsTooltip: FC<PropsWithChildren<TruncatedAuthorsTooltip>> = ({
  values,
  variant,
  children,
  animation,
  isAnimating,
  onRemoveValue,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className={cn('flex flex-wrap gap-1 max-w-xs p-2 z-[1000]')}
        >
          {values.map((val) => (
            <AuthorBadge
              animation={animation}
              isAnimating={isAnimating}
              toggleOption={onRemoveValue}
              value={val}
              variant={variant}
            />
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
