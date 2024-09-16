import { FC } from 'react';

interface TableHeaderProps {
  label: string;
}

export const TableHeader: FC<TableHeaderProps> = ({ label }) => (
  <p className="font-semibold text-lg">{label}</p>
);
