import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC, useEffect, useMemo, useState } from 'react';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../../modules/common/components/ui/button';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { Separator } from '../../modules/common/components/ui/separator';
import { HiCheckCircle, HiDotsCircleHorizontal, HiOutlineHeart, HiQuestionMarkCircle } from 'react-icons/hi';
import { ReadingStatus, SortingType, UserBook } from '@common/contracts';
import { cn } from '../../modules/common/lib/utils';
import { FavoriteBookButton } from '../../modules/book/components/favoriteBookButton/favoriteBookButton';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice';
import { useFindBookshelfByIdQuery } from '../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { FindBookBorrowingsQueryOptions } from '../../modules/borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { HiClock } from 'react-icons/hi';
import { LoadingSpinner } from '../../modules/common/components/spinner/loading-spinner';
import { Skeleton } from '../../modules/common/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../modules/common/components/ui/pagination';
import { FindBooksByBookshelfIdQueryOptions } from '../../modules/book/api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../modules/common/contexts/breadcrumbKeysContext';

const bookshelfSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

const getCountNoun = (len: number): string => {
  switch (len) {
    case 1:
      return 'książka';

    case 2:
    case 3:
    case 4:
      return 'książki';

    default:
      return 'książek';
  }
};

export const View: FC = () => {
  const { id } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(id);

  const breadcrumbKeys = useBreadcrumbKeysContext();

  const dispatch = useBreadcrumbKeysDispatch();

  useEffect(() => {
    if (bookshelfResponse?.name) {
      dispatch({
        key: '$bookshelfName',
        value: bookshelfResponse?.name,
      });

      dispatch({
        key: '$bookshelfId',
        value: bookshelfResponse.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfResponse]);

  useEffect(() => {
    if (breadcrumbKeys['$bookName']) {
      dispatch({
        key: '$bookName',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bookshelfResponse?.name === 'Wypożyczalnia') {
    return <BorrowingBookshelf></BorrowingBookshelf>;
  }

  return <Bookshelf></Bookshelf>;
};

const BorrowedBook: FC<{ userBook: UserBook; index: number }> = ({ userBook, index }) => {
  const navigate = useNavigate();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const {
    data: bookBorrowing,
    isFetching,
    isRefetching,
  } = useQuery(
    FindBookBorrowingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: userBook.id,
      page: 1,
      pageSize: 1,
      sortDate: SortingType.desc,
    }),
  );

  const totalDaysSinceBorrowing = useMemo(() => {
    const millisInDay = 86400000;

    return Math.ceil((Date.now() - new Date(bookBorrowing?.data[0]?.startedAt ?? '').getTime()) / millisInDay);
  }, [bookBorrowing?.data]);

  const getTimeConstraintFormatting = (days: number): string => {
    if (days >= 90) return 'text-red-500';

    return 'text-green-500';
  };

  if (isFetching && !isRefetching) {
    return <LoadingSpinner />;
  }

  return (
    <div
      key={`${userBook.bookId}-${index}`}
      className="relative flex align-middle items-center gap-4 w-full cursor-pointer"
    >
      <div
        onClick={() => {
          navigate({
            to: '/book/tabs/gradesTab/$bookId',
            params: {
              bookId: userBook.id,
            },
          });
        }}
        className="cursor-pointer absolute w-full h-[100%]"
      ></div>
      <div className="z-10">
        <img
          onClick={() => {
            navigate({
              to: '/book/tabs/gradesTab/$bookId',
              params: {
                bookId: userBook.id,
              },
            });
          }}
          src={userBook.imageUrl}
          className="object-contain aspect-square max-w-[200px]"
        />
      </div>
      <div className="z-10 w-full px-12 pointer-events-none">
        <div className="flex justify-between w-full">
          <div className="font-semibold text-lg sm:text-2xl">{userBook.book.title}</div>
          <div
            className={cn(
              'flex gap-2 items-center font-semibold',
              getTimeConstraintFormatting(totalDaysSinceBorrowing),
            )}
          >
            dni: {totalDaysSinceBorrowing} <HiClock className="h-5 w-5" />
          </div>
        </div>
        <Separator className="my-4 bg-primary"></Separator>
        <div className="flex justify-between w-full px-2">
          <p>
            {userBook.book.authors[0]?.name ? `${userBook.book.authors[0]?.name},` : ''} {userBook.book.releaseYear},{' '}
            {userBook.genres[0]?.name}{' '}
          </p>
          <p>wypożyczony przez: {bookBorrowing?.data[0].borrower}</p>
        </div>
      </div>
    </div>
  );
};

export const BorrowingBookshelf: FC = () => {
  const { id } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: user } = useFindUserQuery();

  const { data: bookshelfBooksResponse } = useQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId: id,
      userId: user?.id as string,
    }),
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(id);

  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="p-8 flex flex-col justify-center w-full items-center">
        <div className="flex justify-between w-full sm:max-w-7xl">
          <div>
            <p className="text-xl sm:text-3xl">{bookshelfResponse?.name ?? ' '}</p>
            <p>
              {bookshelfBooksResponse?.data.length ?? 0} {getCountNoun(bookshelfBooksResponse?.data.length ?? 0)}
            </p>
          </div>
          {bookshelfResponse?.name !== 'Wypożyczalnia' && (
            <Button
              onClick={() => {
                navigate({
                  to: `/bookshelf/search`,
                  search: {
                    type: 'isbn',
                    next: 0,
                    bookshelfId: id,
                  },
                });
              }}
            >
              Dodaj książkę
            </Button>
          )}
        </div>
        <div className="flex flex-col justify-center gap-8 pt-8 w-full sm:max-w-7xl">
          {bookshelfBooksResponse?.data.map((userBook, index) => (
            <BorrowedBook
              index={index}
              userBook={userBook}
            />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const BookshelfSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <div
      key={`skeleton-${index}`}
      className="relative flex align-middle items-center gap-4 w-full cursor-pointer"
    >
      <Skeleton className="w-40 h-60" />
      <div className="z-10 w-full px-12 pointer-events-none">
        <div className="flex justify-between w-full">
          <Skeleton className="w-52 h-8" />
          <div className="flex gap-2 items-center justify-center">
            <HiOutlineHeart className="h-8 w-8 text-primary" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>
        <Separator className="my-4 bg-primary"></Separator>
        <Skeleton className="w-40 h-4" />
      </div>
    </div>
  ));
};

export const Bookshelf: FC = () => {
  const { id } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: user } = useFindUserQuery();

  const perPage = 5;

  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data: bookshelfBooksResponse,
    isFetching,
    isRefetching,
  } = useQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId: id,
      userId: user?.id as string,
      page: currentPage,
      pageSize: perPage,
    }),
  );

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelfBooksResponse?.metadata?.total ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
  }, [bookshelfBooksResponse?.metadata?.total]);

  const previousPage = useMemo(() => {
    if (currentPage === 1) {
      return undefined;
    }

    return currentPage - 1;
  }, [currentPage]);

  const nextPage = useMemo(() => {
    if (currentPage === pagesCount) {
      return undefined;
    }

    if (currentPage === 1 && pagesCount > 2) {
      return currentPage + 2;
    } else if (currentPage === 1 && pagesCount <= 2) {
      return currentPage;
    }

    return currentPage + 1;
  }, [currentPage, pagesCount]);

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(id);

  const navigate = useNavigate();

  const readingStatusMap = {
    [ReadingStatus.finished]: HiCheckCircle,
    [ReadingStatus.inProgress]: HiDotsCircleHorizontal,
    [ReadingStatus.toRead]: HiQuestionMarkCircle,
  };

  const readingStatusColor = {
    [ReadingStatus.finished]: 'text-green-400',
    [ReadingStatus.inProgress]: 'text-blue-300',
    [ReadingStatus.toRead]: 'text-slate-500',
  };

  const renderStatusIcon = (book: UserBook) => {
    const Icon = readingStatusMap[book.status];

    return <Icon className={cn('h-7 w-7 cursor-default pointer-events-auto', readingStatusColor[book.status])} />;
  };

  return (
    <AuthenticatedLayout>
      <div className="p-8 flex flex-col justify-center w-full items-center">
        <div className="flex justify-between w-full sm:max-w-7xl">
          <div>
            <p className="text-xl sm:text-3xl">{bookshelfResponse?.name ?? ' '}</p>
            <p>
              {bookshelfBooksResponse?.data.length ?? 0} {getCountNoun(bookshelfBooksResponse?.data.length ?? 0)}
            </p>
          </div>
          <Button
            onClick={() => {
              navigate({
                to: `/bookshelf/search`,
                search: {
                  type: 'isbn',
                  next: 0,
                  bookshelfId: id,
                },
              });
            }}
          >
            Dodaj książkę
          </Button>
        </div>
        <div className="flex flex-col justify-center gap-8 pt-8 w-full sm:max-w-7xl">
          {isFetching && !isRefetching ? (
            <BookshelfSkeleton />
          ) : (
            bookshelfBooksResponse?.data.map((userBook, index) => (
              <div
                key={`${userBook.bookId}-${index}`}
                className="relative flex align-middle items-center gap-4 w-full cursor-pointer"
              >
                <div
                  onClick={() => {
                    navigate({
                      to: '/book/tabs/basicDataTab/$bookId',
                      params: {
                        bookId: userBook.id,
                      },
                    });
                  }}
                  className="cursor-pointer absolute w-full h-[100%]"
                ></div>
                <div className="z-10">
                  <img
                    onClick={() => {
                      navigate({
                        to: '/book/tabs/basicDataTab/$bookId',
                        params: {
                          bookId: userBook.id,
                        },
                      });
                    }}
                    src={userBook.imageUrl || '/book.jpg'}
                    className="object-contain aspect-square w-40 h-60 bg-slate-50"
                  />
                </div>
                <div className="z-10 w-full px-12 pointer-events-none">
                  <div className="flex justify-between w-full">
                    <div className="font-semibold text-lg sm:text-2xl">{userBook.book.title}</div>
                    <div className="flex gap-2 items-center justify-center">
                      <FavoriteBookButton
                        className="pointer-events-auto"
                        userBook={userBook}
                      />
                      {renderStatusIcon(userBook)}
                    </div>
                  </div>
                  <Separator className="my-4 bg-primary"></Separator>
                  <div className="px-2">
                    {userBook.book.authors[0]?.name ? `${userBook.book.authors[0]?.name},` : ''}{' '}
                    {userBook.book.releaseYear ? `${userBook.book.releaseYear},` : null} {userBook.genres[0]?.name}{' '}
                  </div>
                </div>
              </div>
            ))
          )}
          {bookshelfBooksResponse && (bookshelfBooksResponse?.metadata?.total ?? 0) > perPage ? (
            <>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      hasPrevious={currentPage !== 1}
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem
                    className={
                      !(currentPage > 1 && pagesCount > 1) ? 'pointer-events-none hover:text-none hover:bg-none' : ''
                    }
                  >
                    <PaginationLink
                      className={
                        !(currentPage > 1 && pagesCount > 1)
                          ? 'pointer-events-none hover:text-none hover:bg-[unset]'
                          : ''
                      }
                      onClick={() => {
                        if (previousPage === undefined) {
                          return;
                        }

                        if (previousPage - 1 === -1) {
                          return;
                        }

                        if (currentPage === pagesCount && pagesCount === 2) {
                          setCurrentPage(currentPage - 1);

                          return;
                        }

                        if (currentPage === pagesCount) {
                          setCurrentPage(currentPage - 2);

                          return;
                        }

                        setCurrentPage(previousPage);
                      }}
                      isActive={previousPage === undefined}
                    >
                      {previousPage !== undefined && currentPage === pagesCount && pagesCount > 2
                        ? currentPage - 2
                        : previousPage !== undefined
                          ? previousPage
                          : currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={
                        (currentPage !== 1 && currentPage !== pagesCount) ||
                        (pagesCount === 2 && currentPage === pagesCount)
                      }
                      onClick={() => {
                        if (currentPage === 1) {
                          return setCurrentPage(currentPage + 1);
                        }

                        if (pagesCount == currentPage && pagesCount === 2) {
                          return;
                        }

                        if (currentPage === pagesCount) {
                          return setCurrentPage(pagesCount - 1);
                        }
                      }}
                    >
                      {currentPage !== 1
                        ? currentPage === pagesCount && pagesCount > 2
                          ? pagesCount - 1
                          : currentPage
                        : currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                  {pagesCount > 2 ? (
                    <PaginationItem>
                      <PaginationLink
                        isActive={
                          nextPage === undefined && currentPage !== 1 && currentPage === pagesCount && pagesCount > 2
                        }
                        className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                        onClick={() => {
                          if (nextPage) {
                            setCurrentPage(nextPage);
                          }
                        }}
                      >
                        {nextPage === undefined ? pagesCount : nextPage}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <> </>
                  )}
                  <PaginationItem
                    className={currentPage !== pagesCount ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                  >
                    <PaginationNext
                      hasNext={currentPage !== pagesCount}
                      className={
                        !(currentPage !== pagesCount)
                          ? 'pointer-events-none hover:text-none hover:bg-[unset]'
                          : 'pointer-events-auto'
                      }
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>{' '}
              </Pagination>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/bookshelf/$id')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  parseParams: bookshelfSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/shelves'} />;
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves',
      },
      {
        readableName: '$bookshelfName',
        href: `/bookshelf/$bookshelfId`,
      },
    ],
  },
});
