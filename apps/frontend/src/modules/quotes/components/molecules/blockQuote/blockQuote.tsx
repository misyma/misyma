import { Quote } from 'lucide-react';
import type React from 'react';

import { TruncatedTextTooltip } from '../../../../common/components/truncatedTextTooltip/truncatedTextTooltip';
import { cn } from '../../../../common/lib/utils';

type BlockquoteProps = {
  children?: React.ReactNode;
  className?: string;
  author?: string;
  date: string;
  title?: string;
  page?: string;
  variant?: 'modern' | 'minimalist' | 'paper';
  rightButtons?: React.ReactNode;
};

const Blockquote = ({
  date,
  page,
  children,
  className,
  title,
  author,
  variant = 'minimalist',
  rightButtons,
}: BlockquoteProps) => {
  const variants = {
    modern:
      'relative rounded-lg border-l-4 border-primary bg-primary-background py-4 pl-6 pr-4 font-sans italic leading-relaxed text-secondary-foreground',
    minimalist:
      'relative rounded-lg border border-primary-border bg-primary-background py-4 px-6 font-sans italic leading-relaxed text-secondary-foreground',
    paper:
      'relative rounded-lg bg-white dark:bg-gray-800 py-6 px-8 font-sans italic leading-relaxed text-secondary-foreground shadow-md',
  };

  return (
    <div className={cn(variants[variant], 'mb-6', 'w-full h-[180px] relative', className)}>
      {variant === 'modern' && <Quote className="absolute left-1 top-0 h-6 w-6 text-primary opacity-20" />}
      {variant === 'minimalist' && (
        <Quote className="absolute -top-0 left-0 h-6 w-6 text-primary dark:bg-gray-900 p-1" />
      )}
      {variant === 'paper' && (
        <div className="absolute -top-2 -right-2 h-0 w-0 border-t-[20px] border-r-[20px] border-t-primary/20 border-r-white dark:border-r-gray-800"></div>
      )}
      <div className="absolute top-2 right-2 flex space-x-1">{rightButtons}</div>
      <div className={cn('relative z-10 w-[90%] line-clamp-3', variant === 'minimalist' && 'pl-4')}>{children}</div>
      <div className={cn('pt-4 text-sm font-light', variant === 'minimalist' && 'pl-4')}>
        {new Date(date).toLocaleDateString('pl-PL')}
        {page ? `, strona: ${page}` : ''}
      </div>
      {author && (
        <div className="absolute bottom-3 left-0 w-full flex justify-end">
          <TruncatedTextTooltip
            className="w-full"
            text={title + ' - ' + author}
          >
            <p className={cn('mt-4 truncate max-w-3xl font-bold not-italic text-primary text-right pr-4')}>
              {title} — {author}
            </p>
          </TruncatedTextTooltip>
        </div>
      )}
    </div>
  );
};

export { Blockquote };
