import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { cn } from '../../common/lib/utils';

interface AdminTabsProps {
  currentlySelected: 'books' | 'changeRequests' | 'authors';
}

interface AdminTabLinkProps {
  currentlySelected: boolean;
  to: string;
  label: string;
}

const AdminTabLink: FC<AdminTabLinkProps> = ({
  currentlySelected,
  label,
  to,
}) => (
  <Link
    className={cn(
      'font-bold',
      currentlySelected && 'text-primary cursor-default pointer-events-none'
    )}
    to={to}
  >
    {label}
  </Link>
);

export const AdminTabs: FC<AdminTabsProps> = ({ currentlySelected }) => {
  return (
    <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold min-w-96">
      <AdminTabLink
        currentlySelected={currentlySelected === 'authors'}
        label="Autorzy"
        to="/admin/tabs/authors"
      />
      <AdminTabLink
        currentlySelected={currentlySelected === 'books'}
        label="Książki"
        to="/admin/tabs/books"
      />
      <AdminTabLink
        currentlySelected={currentlySelected === 'changeRequests'}
        label="Prośby o zmianę"
        to="/admin/tabs/changeRequests"
      />
    </ul>
  );
};
