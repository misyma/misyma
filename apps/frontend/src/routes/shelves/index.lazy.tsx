import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { type FC, useEffect, useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';

import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { VirtualizedBookshelvesList } from '../../modules/bookshelf/components/bookshelfsList/virtualizedBookshelfList';
import { CreateBookshelfModal } from '../../modules/bookshelf/components/createBookshelfModal/createBookshelfModal';
import { Input } from '../../modules/common/components/input/input';
import { useBreadcrumbKeysDispatch } from '../../modules/common/contexts/breadcrumbKeysContext';
import useDebounce from '../../modules/common/hooks/useDebounce';

const SearchBookshelfField = () => {
  const navigate = useNavigate();

  const [searchedName, setSearchedName] = useState('');

  const debouncedSearchedName = useDebounce(searchedName, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, name: debouncedSearchedName }),
    });
  }, [debouncedSearchedName, navigate]);

  const setCurrentPage = (value: number) => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, page: value }),
    });
  };

  return (
    <Input
      iSize="lg"
      placeholder="Wyszukaj półkę..."
      onChange={(e) => {
        setSearchedName(e.currentTarget.value);

        setCurrentPage(1);
      }}
      includeQuill={false}
      otherIcon={<HiMagnifyingGlass className="text-primary h-8 w-8" />}
    />
  );
};

export const ShelvesPage: FC = () => {
  const breadcrumbKeysDispatch = useBreadcrumbKeysDispatch();

  useEffect(() => {
    breadcrumbKeysDispatch({
      clear: true,
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
      <motion.div
        key={'shelves-view'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={'flex flex-col w-[80vw] sm:w-[90vw] sm:px-48 items-center justify-center gap-4'}
      >
        <div className={'w-full flex items-end justify-between max-w-screen-2xl'}>
          <SearchBookshelfField />
          <CreateBookshelfModal />
        </div>
        <VirtualizedBookshelvesList />
      </motion.div>
    </div>
  );
};

export const Route = createLazyFileRoute('/shelves/')({
  component: () => (
    <AuthenticatedLayout>
      <ShelvesPage />
    </AuthenticatedLayout>
  ),
});
