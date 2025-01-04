import { useInfiniteQuery } from '@tanstack/react-query';
import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { type Book } from '@common/contracts';

import { AuthenticatedLayout } from '../../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import {
  FindBooksInfiniteQueryOptions,
  FindBooksQueryOptions,
} from '../../../../../modules/book/api/user/queries/findBooks/findBooksQueryOptions';
import { FindUserBooksByQueryOptions } from '../../../../../modules/book/api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { BookImageMiniature } from '../../../../../modules/book/components/bookImageMiniature/bookImageMiniature';
import { useSearchBookContextDispatch } from '../../../../../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { Button } from '../../../../../modules/common/components/button/button';
import { Skeleton } from '../../../../../modules/common/components/skeleton/skeleton';
import { LoadingSpinner } from '../../../../../modules/common/components/spinner/loading-spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../../modules/common/components/tooltip/tooltip';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../../modules/common/components/ui/breadcrumbs';
import { BookFormat } from '../../../../../modules/common/constants/bookFormat';
import { ReversedLanguages } from '../../../../../modules/common/constants/languages';
import { useErrorHandledQuery } from '../../../../../modules/common/hooks/useErrorHandledQuery';
import { cn } from '../../../../../modules/common/lib/utils';
import { RequireAuthComponent } from '../../../../../modules/core/components/requireAuth/requireAuthComponent';
import { userStateSelectors } from '../../../../../modules/core/store/states/userState/userStateSlice';

interface FoundBookViewProps {
  onAddBook: (bookId: string) => Promise<void>;
  onCreateManually: () => void;
}
const SingleFoundBookView: FC<FoundBookViewProps> = ({ onAddBook, onCreateManually }) => {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: foundBooks } = useErrorHandledQuery(
    FindBooksQueryOptions({
      ...(searchParams.searchBy === 'title'
        ? {
            title: searchParams.title,
          }
        : {
            isbn: searchParams.isbn,
          }),
      accessToken: accessToken as string,
      page: searchParams.page,
      pageSize: 1,
    }),
  );

  const {
    data: userBookWithIsbn,
    isFetching: checkingForIsbn,
    isRefetching: checkForIsbnInProgress,
  } = useErrorHandledQuery(
    FindUserBooksByQueryOptions({
      accessToken: accessToken as string,
      isbn: searchParams.isbn,
    }),
  );

  const bookExistsOnUserAccount = useMemo(() => {
    if (searchParams.isbn === '' || searchParams.isbn === undefined) {
      return false;
    }

    return (userBookWithIsbn?.data?.length ?? 100) > 0;
  }, [userBookWithIsbn?.data, searchParams.isbn]);

  return (
    <div className="relative  justify-center items-center flex-col-reverse md:flex-row w-full flex h-full gap-8">
      <div className="w-full flex flex-col gap-6 px-8 sm:pr-0 sm:pl-8 sm:ml-4">
        <div className="full flex flex-col justify-center items-center">
          <Breadcrumbs
            className="pb-4"
            crumbs={{
              [1]: (
                <NumericBreadcrumb
                  onClick={() =>
                    navigate({
                      to: '/shelves/bookshelf/search',
                      search: {
                        bookshelfId: searchParams.bookshelfId,
                      },
                    })
                  }
                  className="cursor-pointer"
                  index={1}
                >
                  1
                </NumericBreadcrumb>
              ),
              [2]: (
                <NumericBreadcrumb
                  className={'font-semibold bg-primary text-white border-primary'}
                  index={2}
                >
                  2
                </NumericBreadcrumb>
              ),
              [3]: <NumericBreadcrumb index={3}>3</NumericBreadcrumb>,
            }}
          />
        </div>
        <div className="flex flex-col w-full">
          <span className="text-3xl text-left text-ellipsis w-full line-clamp-2">{foundBooks?.data[0].title}</span>
          <p className="pl-1">{foundBooks?.data[0]?.authors[0]?.name ?? ''}</p>
        </div>
        <div className="border border-gray-400 w-full lg:translate-x-[-2rem] px-4"></div>
        <div className="flex flex-col gap-4 w-full">
          {foundBooks?.data[0].isbn && <p>ISBN: {foundBooks?.data[0].isbn}</p>}
          {foundBooks?.data[0].releaseYear && <p>Rok wydania: {foundBooks?.data[0].releaseYear}</p>}
          {foundBooks?.data[0].language && (
            <p>Język: {ReversedLanguages[foundBooks?.data[0].language]?.toLowerCase()}</p>
          )}
          {foundBooks?.data[0].publisher && <p>Wydawnictwo: {foundBooks?.data[0].publisher}</p>}
          {foundBooks?.data[0].translator && <p>Przekład: {foundBooks?.data[0].translator}</p>}
          {foundBooks?.data[0].format && <p>Format: {BookFormat[foundBooks?.data[0].format]}</p>}
          {foundBooks?.data[0]?.pages && <p>Liczba stron: {foundBooks?.data[0].pages}</p>}
        </div>
        <div className="flex flex-col gap-4">
          {checkingForIsbn || checkForIsbnInProgress || bookExistsOnUserAccount ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  className="flex"
                >
                  <Button
                    onClick={() => onAddBook(foundBooks?.data?.[0].id ?? '')}
                    size="xl"
                    disabled={checkingForIsbn || checkForIsbnInProgress || bookExistsOnUserAccount}
                  >
                    Kontynuuj
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Posiadasz już te książkę na swoim koncie :)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              onClick={() => onAddBook(foundBooks?.data?.[0].id ?? '')}
              size="xl"
            >
              Kontynuuj
            </Button>
          )}
          <p>
            lub{' '}
            <span
              onClick={onCreateManually}
              className="text-primary font-semibold cursor-pointer"
            >
              wprowadź inne dane
            </span>
          </p>
        </div>
      </div>
      <div className="relative w-full flex justify-center items-center h-[250px] md:h-[300px]">
        <img
          src="/books.png"
          alt="Books image"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

interface BookRowProps {
  book: Book;
  onSelect: () => void;
  isSelected: boolean;
}
const BookRow: FC<BookRowProps> = ({ book, onSelect, isSelected }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-9 gap-x-4 p-4 rounded-lg transition-colors duration-200 cursor-pointer',
        isSelected ? 'bg-primary/10 shadow-md' : 'hover:bg-secondary/50',
      )}
      onClick={() => onSelect()}
    >
      <BookImageMiniature
        bookImageSrc={book.imageUrl ?? ''}
        key={`${book.id}-image`}
        className="w-20 h-28 object-cover rounded shadow-sm"
      />
      <div className="col-span-2 font-medium line-clamp-3">{book.title}</div>
      <div className="line-clamp-2 text-muted-foreground">{book.authors?.[0]?.name}</div>
      <div className="text-sm">{book.format}</div>
      <div className="text-sm">{book.releaseYear}</div>
      <div className="line-clamp-2 text-sm text-muted-foreground">{book.publisher}</div>
      <div className="text-sm capitalize">{ReversedLanguages[book.language].toLowerCase()}</div>
      <div className="line-clamp-2 text-sm text-muted-foreground">{book.translator ?? '‐'}</div>
    </div>
  );
};

const ManyFoundBooksView: FC<FoundBookViewProps> = ({}) => {
  const searchParams = Route.useSearch();
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>(undefined);

  const parentRef = useRef<HTMLDivElement>(null);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useInfiniteQuery(
    FindBooksInfiniteQueryOptions({
      accessToken,
      title: searchParams.title,
      pageSize: 20,
    }),
  );

  const allItems = useMemo(
    () =>
      data?.pages
        ?.flat(1)
        .map((page) => page.data)
        .flat(1),
    [data],
  );

  const rowVirtualizer = useVirtualizer({
    count: data?.pages?.[0]?.metadata?.total ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 144,
    overscan: 5,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= (allItems?.length ?? 1) - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, fetchNextPage, allItems, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

  return (
    <div
      ref={parentRef}
      className="w-full h-[700px] 4xl:h-[1068px] overflow-auto no-scrollbar"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <div className="sticky w-full top-0 z-10 bg-background pb-4">
          <div className="grid grid-cols-9 gap-x-2">
            Obrazek
            <div className="col-span-2 line-clamp-3">Tytuł</div>
            <div className="line-clamp-2">Autorzy</div>
            <div>Format</div>
            <div>Rok wydania</div>
            <div className="line-clamp-2">Wydawnictwo</div>
            <div>Język</div>
            <div className="line-clamp-2">Przekład</div>
          </div>
        </div>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= (allItems?.length ?? 0);

          const isFirstLoaderAttempt = isLoading && isLoaderRow;

          const isSubsequentLoader = !isLoading && isLoaderRow && hasNextPage;

          return (
            <div
              key={virtualItem.index}
              style={{
                height: `${virtualItem.size}px`,
                width: '100%',
                position: 'absolute',
                top: '40px',
                left: 0,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isFirstLoaderAttempt && <Skeleton className="w-40 h-40" />}
              {isSubsequentLoader && <Skeleton className="w-40 h-40" />}
              {!isSubsequentLoader && allItems && (
                <BookRow
                  book={allItems[virtualItem.index]}
                  key={allItems[virtualItem.index].id}
                  onSelect={() => {
                    if (selectedRowIndex === virtualItem.index) {
                      setSelectedRowIndex(undefined);
                    } else {
                      setSelectedRowIndex(virtualItem.index);
                    }
                  }}
                  isSelected={virtualItem.index === selectedRowIndex}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SearchResultPage: FC = () => {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const searchCreationDispatch = useSearchBookContextDispatch();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  useEffect(() => {
    if (searchParams.isbn === '' && searchParams.title === '') {
      navigate({
        to: '/shelves/bookshelf/search',
        search: {
          bookshelfId: searchParams.bookshelfId,
          type: 'title',
          searchBy: 'title',
          next: 0,
        },
      });
    }
  }, [searchParams.searchBy, searchParams.bookshelfId, searchParams.isbn, searchParams.title, navigate]);

  const { data: foundBooks, isFetching } = useErrorHandledQuery(
    FindBooksQueryOptions({
      ...(searchParams.searchBy === 'title'
        ? {
            title: searchParams.title,
          }
        : {
            isbn: searchParams.isbn,
          }),
      accessToken: accessToken as string,
      page: searchParams.page,
      pageSize: 1,
    }),
  );

  const { isFetching: checkingForIsbn } = useErrorHandledQuery(
    FindUserBooksByQueryOptions({
      accessToken: accessToken as string,
      isbn: searchParams.isbn,
    }),
  );

  const onTryAgain = () => {
    navigate({
      to: '/shelves/bookshelf/search',
      search: {
        bookshelfId: searchParams.bookshelfId,
        type: 'title',
        next: 0,
      },
    });
  };

  const onCreateManually = () => {
    navigate({
      to: `/shelves/bookshelf/createBook`,
      search: {
        bookshelfId: searchParams.bookshelfId,
      },
    });
  };

  const onAddBook = async (): Promise<void> => {
    const book = foundBooks?.data[0] as Book;

    searchCreationDispatch({
      bookId: book.id,
    });

    searchCreationDispatch({
      title: book.title,
    });

    searchCreationDispatch({
      step: 3,
    });

    navigate({
      to: `/shelves/bookshelf/search/create/${searchParams.bookshelfId}`,
    });
  };

  const render = () => {
    if (foundBooks?.data.length === 0) {
      return (
        <div className="flex justify-center items-center">
          <div className="flex flex-col gap-12 max-w-[38rem]">
            <span className="font-semibold text-xl sm:text-3xl">
              Nie możemy znaleźć danych dla podanego przez Ciebie tytułu
            </span>
            <div className="flex flex-col gap-4">
              <Button
                size="xl"
                onClick={onCreateManually}
              >
                Wprowadź dane
              </Button>
              <p>
                lub{' '}
                <span
                  onClick={onTryAgain}
                  className="text-primary font-medium cursor-pointer"
                >
                  spróbuj ponownie
                </span>
              </p>
            </div>
          </div>
          <div className="flex max-w-[250px] w-full sm:max-w-[500px] sm:min-h-[550px] justify-center items-center">
            <img
              src="/books.png"
              alt="Books image"
              className="object-contain"
            />
          </div>
        </div>
      );
    }

    if (foundBooks?.data && foundBooks?.metadata?.total === 1) {
      return (
        <SingleFoundBookView
          onAddBook={onAddBook}
          onCreateManually={onCreateManually}
        />
      );
    }

    return (
      <ManyFoundBooksView
        onAddBook={onAddBook}
        onCreateManually={onCreateManually}
      />
    );
  };

  if (isFetching) {
    return (
      <AuthenticatedLayout>
        <div className="justify-center max-w-screen-xl mx-auto items-center w-full flex h-full min-h-[700px]">
          <LoadingSpinner></LoadingSpinner>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (checkingForIsbn) {
    return (
      <AuthenticatedLayout>
        <div className="justify-center max-w-screen-xl mx-auto items-center w-full flex h-full min-h-[700px]">
          <LoadingSpinner></LoadingSpinner>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (
    foundBooks?.data &&
    foundBooks.data.length > 0 &&
    searchParams.searchBy === 'title' &&
    searchParams.isbn !== (foundBooks?.data[0].isbn ?? '')
  ) {
    const isbn = foundBooks?.data[0].isbn;

    return <Navigate search={(prev) => ({ ...prev, isbn })}></Navigate>;
  }

  return (
    <AuthenticatedLayout>
      <div className="justify-center max-w-screen-xl mx-auto items-center w-full flex h-full min-h-[700px]">
        {render()}
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/shelves/bookshelf/search/result/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchResultPage />
      </RequireAuthComponent>
    );
  },
});
