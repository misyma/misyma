import { useNavigate } from '@tanstack/react-router';

import { BookNavigationFromEnum, type BookNavigationFrom } from '../../constants';

interface UseNavigateToBookProps {
  bookId: string;
  from: BookNavigationFrom;
}
export const useNavigateToBook = ({ bookId, from }: UseNavigateToBookProps) => {
  const navigate = useNavigate();

  const url = from === BookNavigationFromEnum.shelves ? '/shelves/bookshelf/book/$bookId' : '/mybooks/book/$bookId';

  const navigateToBook = () => {
    navigate({
      to: url,
      params: {
        bookId,
      },
      search: {
        view: 'basicData',
      },
    });
  };

  return {
    navigateToBook,
  };
};
