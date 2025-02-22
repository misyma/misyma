import { type VariantProps } from 'class-variance-authority';
import { XCircle } from 'lucide-react';
import { type FC } from 'react';

import { multiSelectVariants } from './authorMultiComboboxVariants';
import { TruncatedTextTooltip } from '../../../book/components/truncatedTextTooltip/truncatedTextTooltip';
import { Badge } from '../../../common/components/badge';
import { cn } from '../../../common/lib/utils';

interface AuthorBadgeProps extends VariantProps<typeof multiSelectVariants> {
  value: { value: string; label: string };
  isAnimating: boolean;
  animation: number;
  toggleOption: (value: { value: string; label: string }) => void;
}
export const AuthorBadge: FC<AuthorBadgeProps> = ({ value, animation, isAnimating, variant, toggleOption }) => {
  return (
    <Badge
      key={value.value}
      className={cn(isAnimating ? 'animate-bounce' : '', multiSelectVariants({ variant }))}
      style={{ animationDuration: `${animation}s` }}
    >
      <TruncatedTextTooltip
        tooltipClassName="font-normal"
        text={value?.label ?? ''}
      >
        <p className="truncate max-w-32 text-xs font-normal">{value?.label}</p>
      </TruncatedTextTooltip>
      <XCircle
        className="ml-2 h-4 w-4 cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          toggleOption(value);
        }}
      />
    </Badge>
  );
};
