import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import { cn } from '../../lib/utils';
import { ButtonProps, buttonSizesStylesMap, buttonVariantsStylesMap } from '../button/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  hasPrevious?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, hasPrevious = true, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariantsStylesMap[isActive ? 'default' : 'ghost'],
      buttonSizesStylesMap[size],
      !hasPrevious ? 'pointer-events-none bg-white text-primary cursor-not-allowed' : '',
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  hasPrevious = true,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="base"
    className={cn(
      'gap-1 pl-2.5',
      !hasPrevious ? 'pointer-events-none bg-white opacity-50 cursor-not-allowed' : '',
      className,
    )}
    {...props}
  >
    <FaArrowLeftLong
      className={cn(
        'h-6 w-6 hover:text-primary',
        !hasPrevious ? 'pointer-events-none bg-white cursor-not-allowed' : '',
      )}
    />
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  hasNext = true,
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  hasNext?: boolean;
}) => (
  <PaginationLink
    aria-label="Go to next page"
    size="base"
    className={cn(
      'gap-1 pr-2.5',
      !hasNext ? 'pointer-events-none bg-white opacity-50 cursor-not-allowed' : '',
      className,
    )}
    {...props}
  >
    <FaArrowRightLong
      className={cn('h-6 w-6 hover:text-primary', !hasNext ? 'pointer-events-none bg-white cursor-not-allowed' : '')}
    />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
