import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { type FC, Fragment, useEffect, useMemo, useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';

import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { useFindUserBookshelfsQuery } from '../../modules/bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BookshelfsList } from '../../modules/bookshelf/components/bookshelfsList/bookshelfsList';
import { CreateBookshelfModal } from '../../modules/bookshelf/components/createBookshelfModal/createBookshelfModal';
import { Input } from '../../modules/common/components/input/input';
import { Paginator } from '../../modules/common/components/paginator/paginator';
import { useBreadcrumbKeysDispatch } from '../../modules/common/contexts/breadcrumbKeysContext';
import useDebounce from '../../modules/common/hooks/useDebounce';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';

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

const BookshelvesPaginator: FC = () => {
  const navigate = Route.useNavigate();

  const { page, perPage, name } = Route.useSearch();

  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: perPage,
    page,
    name,
  });

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelvesData?.metadata?.total ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
  }, [bookshelvesData?.metadata?.total, perPage]);

  const setCurrentPage = (value: number) => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, page: value }),
    });
  };

  return (
    <Fragment>
      {(bookshelvesData?.metadata?.total ?? 0) > perPage && (
        <Paginator
          pagesCount={pagesCount}
          perPage={perPage}
          onPageChange={setCurrentPage}
          pageIndex={page}
          includeArrows={true}
          itemsCount={bookshelvesData?.metadata.total}
        />
      )}
    </Fragment>
  );
};

export const ShelvesPage: FC = () => {
  const breadcrumbKeysDispatch = useBreadcrumbKeysDispatch();

  const { page, perPage, name } = Route.useSearch();

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
        <BookshelfsList
          page={page}
          perPage={perPage}
          name={name}
        />
        <BookshelvesPaginator />
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
