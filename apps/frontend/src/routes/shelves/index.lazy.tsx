import { createLazyFileRoute } from '@tanstack/react-router';

import { useBreadcrumbKeysDispatch } from '../../modules/common/contexts/breadcrumbKeysContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../modules/core/store/store';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Bookshelf, BookshelfType } from '@common/contracts';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { useFindUserBookshelfsQuery } from '../../modules/bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import {
  setBookshelves,
  setEditMap,
} from '../../modules/core/store/states/bookshelvesState/bookshelfStateSlice';
import { ShelvesSkeleton } from '../../modules/bookshelf/components/bookshelvesSkeleton/shelvesSkeleton';
import { motion } from 'framer-motion';
import { Input } from '../../modules/common/components/input/input';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { Button } from '../../modules/common/components/button/button';
import { BookshelfsList } from '../../modules/bookshelf/components/bookshelfsList/bookshelfsList';
import { Paginator } from '../../modules/common/components/paginator/paginator';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';

export const ShelvesPage: FC = () => {
  const breadcrumbKeysDispatch = useBreadcrumbKeysDispatch();
  const dispatch = useDispatch<AppDispatch>();

  const perPage = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchedName, setSearchedName] = useState('');

  const storeBookshelves = useSelector<RootState, Bookshelf[]>(
    (state) => state.bookshelves.bookshelves
  );
  const editMap = useSelector<RootState, Record<number, boolean>>(
    (state) => state.bookshelves.editMap
  );

  const { data: user } = useFindUserQuery();
  const {
    data: bookshelvesData,
    isLoading,
    isRefetching,
  } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: perPage,
    page: currentPage,
    name: searchedName,
  });
  const [queryBookshelves, setQueryBookshelves] = useState(
    bookshelvesData?.data
  );

  const dispatchBookshelvesUpdate = useCallback(() => {
    if (!bookshelvesData?.data) {
      return;
    }

    const updatedBookshelves = bookshelvesData.data.map((newBookshelf) => {
      const existingBookshelfIndex = storeBookshelves.findIndex(
        (storedBookshelf) => storedBookshelf.id === newBookshelf.id
      );
      if (existingBookshelfIndex === -1) {
        return newBookshelf;
      }

      const existingBookshelf = storeBookshelves[existingBookshelfIndex];
      return {
        ...existingBookshelf,
        ...newBookshelf,
        createdAt: existingBookshelf.createdAt,
      };
    });

    const finalBookshelves = [
      ...storeBookshelves.filter(
        (storedBookshelf) =>
          !updatedBookshelves.some(
            (updatedBookshelf) => updatedBookshelf.id === storedBookshelf.id
          )
      ),
      ...updatedBookshelves,
    ];

    if (updatedBookshelves.length > 0) {
      dispatch(setBookshelves(finalBookshelves));
    }
  }, [bookshelvesData?.data, storeBookshelves, dispatch]);

  useEffect(() => {
    breadcrumbKeysDispatch({
      clear: true,
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (bookshelvesData?.data) {
      setQueryBookshelves(bookshelvesData?.data);
    }
  }, [bookshelvesData]);

  useEffect(() => {
    if (queryBookshelves && queryBookshelves?.length > 0) {
      dispatchBookshelvesUpdate();
    }
    // Todo: figure out the infinite loop occurring here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryBookshelves]);

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelvesData?.metadata?.total ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
  }, [bookshelvesData?.metadata?.total]);

  if (isLoading && !isRefetching) {
    return (
      <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
        <ShelvesSkeleton />
      </div>
    );
  }

  const onAddNewBookshelf = (): void => {
    queryBookshelves?.unshift({
      id: '',
      name: '',
      userId: user?.id as string,
      type: BookshelfType.standard,
      createdAt: new Date().toISOString(),
    });

    dispatch(
      setEditMap({
        ...editMap,
        [0]: true,
      })
    );

    setIsCreatingNew(true);

    setQueryBookshelves([...(queryBookshelves ? queryBookshelves : [])]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-100% px-8 py-1 sm:py-2">
      <motion.div
        key={'shelves-view'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={
          'flex flex-col w-[80vw] sm:w-[90vw] sm:px-48 items-center justify-center gap-4'
        }
      >
        <div
          className={'w-full flex items-end justify-between max-w-screen-2xl'}
        >
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
          <Button
            size="xl"
            onClick={() => onAddNewBookshelf()}
            disabled={isCreatingNew}
          >
            Dodaj nową półkę
          </Button>
        </div>
        <BookshelfsList
          onCreatingNew={(val) => setIsCreatingNew(val)}
          currentPage={currentPage}
          searchedName={searchedName}
        />
        {queryBookshelves &&
          (bookshelvesData?.metadata?.total ?? 0) > perPage && (
            <Paginator
              pagesCount={pagesCount}
              perPage={perPage}
              onPageChange={setCurrentPage}
              pageIndex={currentPage}
              includeArrows={true}
              itemsCount={bookshelvesData?.metadata.total}
            />
          )}
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
