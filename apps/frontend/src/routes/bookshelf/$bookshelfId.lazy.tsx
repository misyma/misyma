import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  FC,
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../../modules/common/components/button/button';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { Separator } from '../../modules/common/components/separator/separator';
import {
  HiCheckCircle,
  HiDotsCircleHorizontal,
  HiOutlineHeart,
  HiQuestionMarkCircle,
} from 'react-icons/hi';
import {
  FindBookshelfResponseBody,
  FindUserBooksResponseBody,
  ReadingStatus,
  SortingType,
  UserBook,
} from '@common/contracts';
import { cn } from '../../modules/common/lib/utils';
import { FavoriteBookButton } from '../../modules/book/components/favoriteBookButton/favoriteBookButton';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice';
import { useFindBookshelfByIdQuery } from '../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { FindBookBorrowingsQueryOptions } from '../../modules/borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { HiClock } from 'react-icons/hi';
import { Skeleton } from '../../modules/common/components/skeleton/skeleton';
import { FindBooksByBookshelfIdQueryOptions } from '../../modules/book/api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../modules/common/contexts/breadcrumbKeysContext';
import { Paginator } from '../../modules/common/components/paginator/paginator';
import { BookImageMiniature } from '../../modules/book/components/bookImageMiniature/bookImageMiniature';
import { useErrorHandledQuery } from '../../modules/common/hooks/useErrorHandledQuery';
import { ScrollArea } from '../../modules/common/components/scrollArea/scroll-area';

const bookshelfSearchSchema = z.object({
  bookshelfId: z.string().uuid().catch(''),
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
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

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

interface BookAuthorDetailsProps {
  userBook: UserBook;
}
const BookAuthorDetails: FC<PropsWithChildren<BookAuthorDetailsProps>> = ({
  userBook,
  children,
}) => {
  return (
    <div>
      <p>
        {userBook.book.authors[0]?.name
          ? `${userBook.book.authors[0]?.name},`
          : ''}{' '}
        {userBook.book.releaseYear ? `${userBook.book.releaseYear},` : null}{' '}
        {userBook.genres[0]?.name}{' '}
      </p>
      {children}
    </div>
  );
};

const BookTitle: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="font-semibold text-lg sm:text-2xl">
      <p className="max-w-40 sm:max-w-xl md:max-w-2xl truncate inline-block">
        {title}
      </p>
    </div>
  );
};

const BookshelfBookImageMiniature: FC<{ userBook: UserBook }> = ({
  userBook,
}) => {
  const navigate = useNavigate();

  return (
    <div className="z-10">
      <BookImageMiniature
        className="w-20"
        onClick={() => {
          navigate({
            to: '/book/tabs/basicDataTab/$bookId',
            params: {
              bookId: userBook.id,
            },
          });
        }}
        userBook={userBook}
      />
    </div>
  );
};

const BookshelfBook: FC<{
  userBook: UserBook;
  index: number;
  isBorrowed: boolean;
}> = ({ userBook, index, isBorrowed }) => {
  const navigate = useNavigate();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookBorrowing } = useErrorHandledQuery(
    FindBookBorrowingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: userBook.id,
      page: 1,
      pageSize: 1,
      sortDate: SortingType.desc,
      isOpen: true,
    })
  );

  const totalDaysSinceBorrowing = useMemo(() => {
    if (!isBorrowed) {
      return 0;
    }
    const millisecondsInDay = 86400000;

    return Math.ceil(
      (Date.now() -
        new Date(bookBorrowing?.data[0]?.startedAt ?? '').getTime()) /
        millisecondsInDay
    );
  }, [bookBorrowing?.data, isBorrowed]);

  const getTimeConstraintFormatting = (days: number): string => {
    if (days >= 90) return 'text-red-500';

    return 'text-green-500';
  };

  const readingStatusMap = useMemo(
    () => ({
      [ReadingStatus.finished]: HiCheckCircle,
      [ReadingStatus.inProgress]: HiDotsCircleHorizontal,
      [ReadingStatus.toRead]: HiQuestionMarkCircle,
    }),
    []
  );
  const readingStatusColor = useMemo(
    () => ({
      [ReadingStatus.finished]: 'text-green-400',
      [ReadingStatus.inProgress]: 'text-blue-300',
      [ReadingStatus.toRead]: 'text-slate-500',
    }),
    []
  );

  const renderStatusIcon = useCallback(
    (book: UserBook) => {
      const Icon = readingStatusMap[book.status];

      return (
        <Icon
          className={cn(
            'h-7 w-7 cursor-default pointer-events-auto',
            readingStatusColor[book.status]
          )}
        />
      );
    },
    [readingStatusMap, readingStatusColor]
  );

  return (
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
      <BookshelfBookImageMiniature userBook={userBook} />
      <div className="z-10 w-full pointer-events-none">
        <div className="flex justify-between w-full">
          <BookTitle title={userBook.book.title} />
          <div
            className={cn(
              'flex gap-2 items-center font-semibold',
              getTimeConstraintFormatting(totalDaysSinceBorrowing)
            )}
          >
            {isBorrowed ? (
              <Fragment>
                dni: {totalDaysSinceBorrowing} <HiClock className="h-5 w-5" />{' '}
              </Fragment>
            ) : (
              <div className="flex gap-2 items-center justify-center">
                <FavoriteBookButton
                  className="pointer-events-auto"
                  bookId={userBook.id}
                />
                {renderStatusIcon(userBook)}
              </div>
            )}
          </div>
        </div>
        <Separator className="my-1 bg-primary"></Separator>
        <BookAuthorDetails userBook={userBook}>
          {isBorrowed && (
            <p>wypożyczony przez: {bookBorrowing?.data[0].borrower}</p>
          )}
        </BookAuthorDetails>
      </div>
    </div>
  );
};

interface BookshelfTopBarProps {
  bookshelfResponse: FindBookshelfResponseBody | undefined;
  bookshelfBooksResponse: FindUserBooksResponseBody | undefined;
  bookshelfId: string;
}
const BookshelfTopBar: FC<BookshelfTopBarProps> = ({
  bookshelfResponse,
  bookshelfBooksResponse,
  bookshelfId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between w-full sm:max-w-7xl">
      <div>
        <p className="text-xl sm:text-3xl">{bookshelfResponse?.name ?? ' '}</p>
        <p>
          {bookshelfBooksResponse?.metadata.total ?? 0}{' '}
          {getCountNoun(bookshelfBooksResponse?.metadata.total ?? 0)}
        </p>
      </div>
      <Button
        size="xl"
        onClick={() => {
          navigate({
            to: `/bookshelf/search`,
            search: {
              type: 'isbn',
              next: 0,
              bookshelfId,
            },
          });
        }}
      >
        Dodaj książkę
      </Button>
    </div>
  );
};

export const BorrowingBookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: user } = useFindUserQuery();

  const { data: bookshelfBooksResponse } = useErrorHandledQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId,
      userId: user?.id as string,
    })
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  const pageCount = useMemo(() => {
    return (
      Math.ceil((bookshelfBooksResponse?.metadata?.total ?? 0) / perPage) || 1
    );
  }, [bookshelfBooksResponse?.metadata.total, perPage]);

  const renderPaginator = useMemo(() => {
    return (
      (bookshelfBooksResponse?.metadata?.total ?? 0) > perPage && (
        <Paginator
          onPageChange={setCurrentPage}
          pageIndex={currentPage}
          pagesCount={pageCount ?? 0}
          perPage={perPage}
          includeArrows={true}
          itemsCount={bookshelfBooksResponse?.metadata?.total}
        />
      )
    );
  }, [bookshelfBooksResponse?.metadata?.total, currentPage, pageCount]);

  return (
    <AuthenticatedLayout>
      <div className="p-8 flex flex-col justify-center w-full items-center">
        <BookshelfTopBar
          bookshelfBooksResponse={bookshelfBooksResponse}
          bookshelfId={bookshelfId}
          bookshelfResponse={bookshelfResponse}
        />
        <div className="flex flex-col justify-center gap-8 pt-8 w-full sm:max-w-7xl">
          {renderPaginator}
          <ScrollArea className="w-full h-[600px]">
            <div className="flex flex-col gap-2">
              {bookshelfBooksResponse?.data.map((userBook, index) => (
                <BookshelfBook
                  index={index}
                  userBook={userBook}
                  isBorrowed={true}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const BookshelfSkeleton = () => {
  return Array.from({ length: 10 }).map((_, index) => (
    <div
      key={`skeleton-${index}`}
      className="relative flex align-middle items-center gap-4 w-full cursor-default"
    >
      <Skeleton className="w-20 h-20" />
      <div className="z-10 w-full pointer-events-none">
        <div className="flex justify-between w-full">
          <Skeleton className="w-52 h-6" />
          <div className="flex gap-2 items-center justify-center">
            <HiOutlineHeart className="h-8 w-8 text-primary cursor-none" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>
        <Separator className="my-1 bg-primary"></Separator>
        <Skeleton className="w-40 h-4" />
      </div>
    </div>
  ));
};

export const Bookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: user } = useFindUserQuery();

  const {
    data: bookshelfBooksResponse,
    isFetching,
    isRefetching,
  } = useErrorHandledQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId,
      userId: user?.id as string,
      page: currentPage,
      pageSize: perPage,
    })
  );

  const pageCount = useMemo(() => {
    return (
      Math.ceil((bookshelfBooksResponse?.metadata?.total ?? 0) / perPage) || 1
    );
  }, [bookshelfBooksResponse?.metadata.total, perPage]);

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  const renderPaginator = useMemo(() => {
    return (
      (bookshelfBooksResponse?.metadata?.total ?? 0) > perPage && (
        <Paginator
          onPageChange={setCurrentPage}
          pageIndex={currentPage}
          pagesCount={pageCount ?? 0}
          perPage={perPage}
          includeArrows={true}
          itemsCount={bookshelfBooksResponse?.metadata?.total}
        />
      )
    );
  }, [bookshelfBooksResponse?.metadata?.total, currentPage, pageCount]);

  return (
    <AuthenticatedLayout>
      <div className="p-8 flex flex-col justify-center w-full items-center">
        <BookshelfTopBar
          bookshelfBooksResponse={bookshelfBooksResponse}
          bookshelfId={bookshelfId}
          bookshelfResponse={bookshelfResponse}
        />
        <div
          key={bookshelfId}
          className="flex flex-col justify-center pt-8 w-full sm:max-w-7xl"
        >
          {renderPaginator}
          <ScrollArea className="w-full h-[600px] pr-8">
            <div className="flex flex-col gap-2">
              {isFetching && !isRefetching ? (
                <BookshelfSkeleton />
              ) : (
                bookshelfBooksResponse?.data.map((userBook, index) => (
                  <BookshelfBook
                    index={index}
                    isBorrowed={false}
                    userBook={userBook}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/bookshelf/$bookshelfId')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  parseParams: bookshelfSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/mybooks'} />;
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Moje książki',
        href: '/mybooks/',
      },
      {
        readableName: '$bookshelfName',
        href: `/bookshelf/$bookshelfId`,
      },
    ],
  },
});
