import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { RxDotsHorizontal } from 'react-icons/rx';
import { cn } from '../../lib/utils';

export interface BreadcrumbsProps {
  crumbs: Record<number, JSX.Element>;
  className?: string;
}

export const Breadcrumbs = ({ crumbs, className }: BreadcrumbsProps): JSX.Element => {
  const entries = Object.entries(crumbs);

  return (
    <div className={
      cn(
        "flex flex-row gap-2 w-full justify-center items-center align-middle py-4",
        className
      )
    }>
      {entries.map(([key, value], i) => (
        <>
          <div key={`${key}-breadcrumb`}>{value}</div>
          {i < entries.length - 1 ? <RxDotsHorizontal /> : null}
        </>
      ))}
    </div>
  );
};

interface NumericBreadcrumbProps extends ComponentPropsWithoutRef<'div'> {
  index: number;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export const NumericBreadcrumb = ({
  className,
  index,
  onClick,
  children,
  ...rest
}: NumericBreadcrumbProps): JSX.Element => {
  return (
    <div
      className={cn(
        'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl',
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {children ? children : index}
    </div>
  );
};
