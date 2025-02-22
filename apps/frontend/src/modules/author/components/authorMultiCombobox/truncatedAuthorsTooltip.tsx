import { type VariantProps } from 'class-variance-authority';
import { XCircle } from 'lucide-react';
import { type FC, type PropsWithChildren } from 'react';

import { multiSelectVariants } from './authorMultiComboboxVariants';
import { Badge } from '../../../common/components/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { cn } from '../../../common/lib/utils';

interface TruncatedAuthorsTooltip extends VariantProps<typeof multiSelectVariants> {
  values: { label: string; value: string }[];
  onRemoveValue: (val: { label: string; value: string }) => void;
}
export const TruncatedAuthorsTooltip: FC<PropsWithChildren<TruncatedAuthorsTooltip>> = ({
  values,
  variant,
  children,
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
            <Badge
              key={val.value}
              className={cn(
                'bg-transparent text-foreground border-foreground/1 hover:bg-transparent font-normal text-xs',
                multiSelectVariants({ variant }),
              )}
            >
              {val.label}
              <XCircle
                className="ml-2 h-4 w-4 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveValue(val);
                }}
              />
            </Badge>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
