import { Link } from '@tanstack/react-router';
import { type FC } from 'react';

import { cn } from '../../../../common/lib/utils';
import { BookNavigationFromEnum, type BookNavigationFrom } from '../../../constants';

interface BookTabLinkProps {
  link: string;
  label: string;
  selected: boolean;
}
export const BookTabLink: FC<BookTabLinkProps> = ({ label, link, selected }) => {
  return (
    <Link
      className={cn('cursor-pointer', selected ? 'cursor-default pointer-events-none text-primary font-bold' : '')}
      to={link}
    >
      {label}
    </Link>
  );
};

interface BookTabNavigationProps {
  bookId: string;
  currentTab: 'basicData' | 'quotations' | 'grades';
  from: BookNavigationFrom;
}
export const BookTabNavigation: FC<BookTabNavigationProps> = ({ from, bookId, currentTab }) => {
  const baseUrl =
    from === BookNavigationFromEnum.shelves ? '/shelves/bookshelf/book/' + bookId : '/mybooks/book/' + bookId;

  return (
    <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
      <li>
        <BookTabLink
          label="Dane podstawowe"
          link={`${baseUrl}?view=basicData`}
          selected={currentTab === 'basicData'}
        />
      </li>
      <li>
        <BookTabLink
          label="Cytaty"
          link={`${baseUrl}?view=quotations`}
          selected={currentTab === 'quotations'}
        />
      </li>
      <li>
        <BookTabLink
          label="Oceny"
          link={`${baseUrl}?view=grades`}
          selected={currentTab === 'grades'}
        />
      </li>
    </ul>
  );
};
