import { useRouter } from '@tanstack/react-router';
import { BookNavigationFromEnum } from '../../constants';

interface Props<T extends Record<keyof typeof BookNavigationFromEnum, string>> {
  urlMapping: T;
}

// todo: remove duplication from those types if possible
export const useBookNavigationSource = <T extends Record<keyof typeof BookNavigationFromEnum, string>>({ urlMapping }: Props<T>) => {
  const router = useRouter();
  const from = router.latestLocation.href.includes('/mybooks')
    ? BookNavigationFromEnum.books
    : BookNavigationFromEnum.shelves;
  
  return {
    from,
    url: urlMapping[from] as T[typeof from]
  };
};