import { type VariantProps } from 'class-variance-authority';
import { type FC, type PropsWithChildren } from 'react';

import { multiSelectVariants } from './authorMultiComboboxVariants';
import { Badge } from '../../../common/components/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { cn } from '../../../common/lib/utils';

interface TruncatedAuthorsTooltip extends VariantProps<typeof multiSelectVariants> {
  values: string[];
}
export const TruncatedAuthorsTooltip: FC<PropsWithChildren<TruncatedAuthorsTooltip>> = ({
  values,
  variant,
  children,
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
            <Badge
              key={val}
              className={cn(
                'bg-transparent text-foreground border-foreground/1 hover:bg-transparent font-normal text-xs',
                multiSelectVariants({ variant }),
              )}
            >
              {val}
            </Badge>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
