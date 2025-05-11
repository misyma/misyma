import { useInfiniteQuery } from '@tanstack/react-query';
import { FindBooksInfiniteQueryOptions } from '../../api/user/queries/findBooks/findBooksQueryOptions';

interface Props {
  search: string;
  searchBy: 'isbn' | 'title';
}
export const useInfiniteBookSearch = ({ search, searchBy }: Props) => {
  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useInfiniteQuery({
    ...FindBooksInfiniteQueryOptions({
      title: searchBy === 'title' ? search : undefined,
      isbn: searchBy === 'isbn' ? search : undefined,
      excludeOwned: true,
      pageSize: 20,
    }),
    enabled: searchBy && search.length > 0,
  });

  return {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
  };
};
