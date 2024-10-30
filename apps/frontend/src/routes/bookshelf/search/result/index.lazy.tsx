import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { LoadingSpinner } from '../../../../modules/common/components/spinner/loading-spinner';
import { Button } from '../../../../modules/common/components/button/button';
import { Paginator } from '../../../../modules/common/components/paginator/paginator';
import {
  Breadcrumbs,
  NumericBreadcrumb,
} from '../../../../modules/common/components/ui/breadcrumbs';
import { useSearchBookContextDispatch } from '../../../../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FindBooksQueryOptions } from '../../../../modules/book/api/user/queries/findBooks/findBooksQueryOptions';
import { Book } from '@common/contracts';
import { FindUserBooksByQueryOptions } from '../../../../modules/book/api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../modules/common/components/tooltip/tooltip';
import { BookFormat } from '../../../../modules/common/constants/bookFormat';
import { ReversedLanguages } from '../../../../modules/common/constants/languages';
import { AutoselectedInput } from '../../../../modules/common/components/autoselectedInput/autoselectedInput';

export const SearchResultPage: FC = () => {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const [manualPageNumberInputOpen, setManualPageNumberInputOpen] =
    useState(false);
  const searchCreationDispatch = useSearchBookContextDispatch();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const inputValue = useRef(0);

  useEffect(() => {
    if (searchParams.isbn === '' && searchParams.title === '') {
      navigate({
        to: '/bookshelf/search',
        search: {
          bookshelfId: searchParams.bookshelfId,
          type: 'title',
          searchBy: 'title',
          next: 0,
        },
      });
    }

    if (searchParams.bookshelfId === '') {
      navigate({
        to: '/shelves',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.searchBy]);

  const { data: foundBooks, isFetching } = useQuery(
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
    })
  );

  const totalBooks = useMemo(
    () => foundBooks?.metadata.total ?? 0,
    [foundBooks?.metadata.total]
  );

  const {
    data: userBookWithIsbn,
    isFetching: checkingForIsbn,
    isRefetching: checkForIsbnInProgress,
  } = useQuery(
    FindUserBooksByQueryOptions({
      accessToken: accessToken as string,
      isbn: searchParams.isbn,
    })
  );

  const bookExistsOnUserAccount = useMemo(() => {
    if (searchParams.isbn === '' || searchParams.isbn === undefined) {
      return false;
    }

    return (userBookWithIsbn?.data?.length ?? 100) > 0;
  }, [userBookWithIsbn?.data, searchParams.isbn]);

  const onTryAgain = () => {
    navigate({
      to: '/bookshelf/search',
      search: {
        bookshelfId: searchParams.bookshelfId,
        type: 'title',
        next: 0,
      },
    });
  };

  const onCreateManually = () => {
    navigate({
      to: `/bookshelf/createBook/$id`,
      params: {
        id: searchParams.bookshelfId,
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
      to: `/bookshelf/search/create/${searchParams.bookshelfId}`,
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
              <Button size="xl" onClick={onCreateManually}>
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
                        to: '/bookshelf/search',
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
                    className={
                      'font-semibold bg-primary text-white border-primary'
                    }
                    index={2}
                  >
                    2
                  </NumericBreadcrumb>
                ),
                [3]: <NumericBreadcrumb index={3}>3</NumericBreadcrumb>,
              }}
            />
            {totalBooks > 1 ? (
              <span className="flex gap-2 font-bold text-2xl text-primary">
                {!manualPageNumberInputOpen ? (
                  <p
                    className="cursor-pointer"
                    onClick={() => setManualPageNumberInputOpen(true)}
                  >
                    {searchParams.page}
                  </p>
                ) : (
                  <AutoselectedInput
                    className="sm:w-20 w-20 h-10 text-xl font-bold"
                    containerClassName="sm:w-20 w-20 h-10"
                    includeQuill={false}
                    type="number"
                    onChange={(val) => {
                      if (
                        val.currentTarget.value &&
                        !Number.isNaN(Number(val.currentTarget.value))
                      ) {
                        inputValue.current = Number(val.currentTarget.value);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        navigate({
                          to: '',
                          search: (prev) => ({
                            ...prev,
                            page: inputValue.current,
                          }),
                        });

                        setManualPageNumberInputOpen(false);
                      }
                    }}
                  ></AutoselectedInput>
                )}
                <p> z </p>
                <p>{totalBooks}</p>
              </span>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col w-full">
            {totalBooks > 1 ? (
              <Paginator
                version={1}
                pageIndex={searchParams.page}
                rootClassName="w-full flex items-center h-16 text-xl sm:text-3xl justify-normal"
                onPageChange={(page) => {
                  navigate({
                    to: '',
                    search: (prev) => ({
                      ...prev,
                      isbn: foundBooks?.data[0].isbn ?? '',
                      page,
                    }),
                  });
                }}
                pagesCount={totalBooks}
                pageNumberSlot={
                  <span className="text-left text-ellipsis w-full line-clamp-2">
                    {foundBooks?.data[0].title}
                  </span>
                }
                includeArrows={true}
                contentClassName="w-full"
                itemsCount={foundBooks?.metadata.total}
              />
            ) : (
              // className="font-bold text-2xl text-primary"
              <span className="text-3xl text-left text-ellipsis w-full line-clamp-2">
                {foundBooks?.data[0].title}
              </span>
            )}
            <p className="pl-1">
              {foundBooks?.data[0]?.authors[0]?.name ?? ''}
            </p>
          </div>
          <div className="border border-gray-400 w-full lg:translate-x-[-2rem] px-4"></div>
          <div className="flex flex-col gap-4 w-full">
            {foundBooks?.data[0].isbn && (
              <p>ISBN: {foundBooks?.data[0].isbn}</p>
            )}
            {foundBooks?.data[0].releaseYear && (
              <p>Rok wydania: {foundBooks?.data[0].releaseYear}</p>
            )}
            {foundBooks?.data[0].language && (
              <p>
                Język:{' '}
                {ReversedLanguages[foundBooks?.data[0].language]?.toLowerCase()}
              </p>
            )}
            {foundBooks?.data[0].publisher && (
              <p>Wydawnictwo: {foundBooks?.data[0].publisher}</p>
            )}
            {foundBooks?.data[0].translator && (
              <p>Przekład: {foundBooks?.data[0].translator}</p>
            )}
            {foundBooks?.data[0].format && (
              <p>Format: {BookFormat[foundBooks?.data[0].format]}</p>
            )}
            {foundBooks?.data[0]?.pages && (
              <p>Liczba stron: {foundBooks?.data[0].pages}</p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {checkingForIsbn ||
            checkForIsbnInProgress ||
            bookExistsOnUserAccount ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild className="flex">
                    <Button
                      onClick={onAddBook}
                      size="xl"
                      disabled={
                        checkingForIsbn ||
                        checkForIsbnInProgress ||
                        bookExistsOnUserAccount
                      }
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
              <Button onClick={onAddBook} size="xl">
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

export const Route = createLazyFileRoute('/bookshelf/search/result/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchResultPage />
      </RequireAuthComponent>
    );
  },
});
