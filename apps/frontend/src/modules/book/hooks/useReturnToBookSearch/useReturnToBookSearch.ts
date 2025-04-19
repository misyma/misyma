import { useNavigate, useSearch } from '@tanstack/react-router';
import { useBookNavigationSource } from '../useBookNavigationSource/useBookNavigationSource';

export const useReturnToBookSearch = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });

  const { url } = useBookNavigationSource({
    urlMapping: {
      books: '/mybooks/search',
      shelves: '/shelves/bookshelf/search',
    } as const,
  });

  const onReturnToBookSearch = () => {
    const search = searchParams;

    navigate({
      to: url,
      search: {
        ...search,
      },
    });
  };

  return {
    onReturnToBookSearch,
  };
};
