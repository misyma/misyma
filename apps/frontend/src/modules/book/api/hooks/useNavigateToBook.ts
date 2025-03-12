import { useNavigate, useRouter } from '@tanstack/react-router';

import { BookNavigationFromEnum } from '../../constants';

interface UseNavigateToBookProps {
  bookId: string;
}
export const useNavigateToBook = ({ bookId }: UseNavigateToBookProps) => {
  const navigate = useNavigate();

  const router = useRouter();

  const from =
    router.latestLocation.href === '/mybooks' ? BookNavigationFromEnum.books : BookNavigationFromEnum.shelves;

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
