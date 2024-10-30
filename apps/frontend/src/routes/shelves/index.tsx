import { FC, useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { createFileRoute } from '@tanstack/react-router';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { Button } from '../../modules/common/components/button/button';
import { BookshelfType } from '@common/contracts';
import { useFindUserBookshelfsQuery } from '../../modules/bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useBreadcrumbKeysDispatch } from '../../modules/common/contexts/breadcrumbKeysContext';
import { ShelvesSkeleton } from '../../modules/bookshelf/components/bookshelvesSkeleton/shelvesSkeleton';

import styles from './index.module.css';
import { Paginator } from '../../modules/common/components/paginator/paginator';
import { Input } from '../../modules/common/components/input/input';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { BookshelfsList } from '../../modules/bookshelf/components/bookshelfsList/bookshelfsList';

export const ShelvesPage: FC = () => {
  const dispatch = useBreadcrumbKeysDispatch();

  const perPage = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchedName, setSearchedName] = useState('');
  const [editMap, setEditMap] = useState<Record<number, boolean>>({});

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
  const [bookshelves, setBookshelves] = useState(bookshelvesData?.data);

  useEffect(() => {
    dispatch({
      clear: true,
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setBookshelves(bookshelvesData?.data);
  }, [bookshelvesData]);

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelvesData?.metadata?.total ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
  }, [bookshelvesData?.metadata?.total]);

  if (isLoading && !isRefetching) {
    return (
      <AuthenticatedLayout>
        <ShelvesSkeleton />
      </AuthenticatedLayout>
    );
  }

  const onAddNewBookshelf = (): void => {
    bookshelves?.unshift({
      id: '',
      name: '',
      userId: user?.id as string,
      type: BookshelfType.standard,
      createdAt: new Date().toISOString(),
    });

    setIsCreatingNew(true);

    setBookshelves([...(bookshelves ? bookshelves : [])]);

    setEditMap({
      ...editMap,
      [0]: true,
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-2">
        <div className={styles['page-container']}>
          <div className={styles['action-bar-container']}>
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
          {bookshelves && (bookshelvesData?.metadata?.total ?? 0) > perPage && (
            <Paginator
              pagesCount={pagesCount}
              perPage={perPage}
              onPageChange={setCurrentPage}
              pageIndex={currentPage}
              includeArrows={true}
              itemsCount={bookshelvesData?.metadata.total}
            />
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/shelves/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <ShelvesPage />
      </RequireAuthComponent>
    );
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
    ],
  },
});
