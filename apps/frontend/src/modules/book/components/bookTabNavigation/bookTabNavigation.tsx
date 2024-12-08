import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { cn } from '../../../common/lib/utils';

interface BookTabLinkProps {
  link: string;
  label: string;
  selected: boolean;
}
export const BookTabLink: FC<BookTabLinkProps> = ({
  label,
  link,
  selected,
}) => {
  return (
    <Link
      className={cn(
        'cursor-pointer',
        selected
          ? 'cursor-default pointer-events-none text-primary font-bold'
          : ''
      )}
      to={link}
    >
      {label}
    </Link>
  );
};

interface BookTabNavigationProps {
  bookId: string;
  currentTab: 'basicData' | 'quotations' | 'grades';
}
export const BookTabNavigation: FC<BookTabNavigationProps> = ({
  bookId,
  currentTab,
}) => {
  return (
    <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
      <li>
        <BookTabLink
          label="Dane podstawowe"
          link={`/shelves/bookshelf/book/tabs/basicDataTab/${bookId}`}
          selected={currentTab === 'basicData'}
        />
      </li>
      <li>
        <BookTabLink
          label="Cytaty"
          link={`/shelves/bookshelf/book/tabs/quotationsTab/${bookId}`}
          selected={currentTab === 'quotations'}
        />
      </li>
      <li>
        <BookTabLink
          label="Oceny"
          link={`/shelves/bookshelf/book/tabs/gradesTab/${bookId}`}
          selected={currentTab === 'grades'}
        />
      </li>
    </ul>
  );
};
