import { useNavigate } from '@tanstack/react-router';

interface UseNavigateToBookProps {
  bookId: string;
  from: 'shelves' | 'books';
}
export const useNavigateToBook = ({ bookId, from }: UseNavigateToBookProps) => {
  const navigate = useNavigate();

  const url = from === 'shelves' ? '/shelves/bookshelf/book/$bookId' : '/mybooks/book/$bookId';

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
