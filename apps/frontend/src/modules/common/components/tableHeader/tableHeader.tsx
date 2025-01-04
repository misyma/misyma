import { type FC } from 'react';

import { cn } from '../../lib/utils';

interface TableHeaderProps {
  label: string;
  className?: string;
}

export const TableHeader: FC<TableHeaderProps> = ({ label, className }) => (
  <p className={cn('font-semibold text-lg', className)}>{label}</p>
);
