import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { LoadingSpinner } from '../../../../modules/common/components/spinner/loading-spinner';
import { Button } from '../../../../modules/common/components/button/button';
import { Paginator } from '../../../../modules/common/components/paginator/paginator';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../modules/common/components/ui/breadcrumbs';
import { useSearchBookContextDispatch } from '../../../../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { FC, useEffect, useMemo, useState } from 'react';
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

export const SearchResultPage: FC = () => {
  const searchParams = Route.useSearch();

  const navigate = useNavigate();

  const searchCreationDispatch = useSearchBookContextDispatch();

  const [currentBookIsbn, setCurrentBookIsbn] = useState('');

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  useEffect(() => {
    if (searchParams.isbn === '' && searchParams.title === '') {
      navigate({
        to: '/bookshelf/search',
        search: {
          bookshelfId: searchParams.bookshelfId,
          type: 'title',
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
  }, [searchParams]);

  const { data: foundBooks, isFetching } = useQuery(
    FindBooksQueryOptions({
      title: searchParams.title,
      isbn: searchParams.isbn,
      accessToken: accessToken as string,
    }),
  );

  const {
    data: userBookWithIsbn,
    isFetching: initialCheckForIsbnInProgress,
    isRefetching: checkForIsbnInProgress,
  } = useQuery(
    FindUserBooksByQueryOptions({
      accessToken: accessToken as string,
      isbn: currentBookIsbn,
    }),
  );

  const bookExistsOnUserAccount = useMemo(() => (userBookWithIsbn?.data?.length ?? 100) > 0, [userBookWithIsbn?.data]);

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
    const book = foundBooks?.data[currentPage - 1] as Book;

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

  const booksCount = useMemo(() => {
    return foundBooks?.data.length ?? 0;
  }, [foundBooks]);

  const [currentPage, setCurrentPage] = useState<number>(1);

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

    return (
      <div className="relative  justify-center items-center flex-col-reverse md:flex-row w-full flex h-full gap-8">
        <div className="w-full flex flex-col gap-6 px-8 sm:pr-0 sm:pl-8 sm:ml-4">
          <div className="full flex flex-col justify-center items-center">
            <Breadcrumbs
              className="pb-4"
              crumbs={{
                [1]: <NumericBreadcrumb index={1}>1</NumericBreadcrumb>,
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
            {booksCount > 1 ? (
              <span className="font-bold text-2xl text-primary">
                {currentPage} z {booksCount}
              </span>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col w-full">
            {booksCount > 1 ? (
              <Paginator
                rootClassName="w-full flex items-center h-16 text-xl sm:text-3xl justify-normal"
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setCurrentBookIsbn(foundBooks?.data[currentPage - 1].isbn ?? '');
                }}
                pagesCount={booksCount}
                pageNumberSlot={
                  <span className="text-left text-ellipsis w-full line-clamp-2">
                    {foundBooks?.data[currentPage - 1].title}
                  </span>
                }
                contentClassName="w-full"
              />
            ) : (
              // className="font-bold text-2xl text-primary"
              <span className="text-3xl text-left text-ellipsis w-full line-clamp-2">
                {foundBooks?.data[currentPage - 1].title}
              </span>
            )}
            <p className="pl-1">{foundBooks?.data[currentPage - 1]?.authors[0]?.name ?? ''}</p>
          </div>
          <div className="border border-gray-400 w-full lg:translate-x-[-2rem] px-4"></div>
          <div className="flex flex-col gap-4 w-full">
            {foundBooks?.data[currentPage - 1].isbn && <p>ISBN: {foundBooks?.data[currentPage - 1].isbn}</p>}
            {foundBooks?.data[currentPage - 1].releaseYear && (
              <p>Rok wydania: {foundBooks?.data[currentPage - 1].releaseYear}</p>
            )}
            {foundBooks?.data[currentPage - 1].language && (
              <p>Język: {ReversedLanguages[foundBooks?.data[currentPage - 1].language]?.toLowerCase()}</p>
            )}
            {foundBooks?.data[currentPage - 1].publisher && (
              <p>Wydawnictwo: {foundBooks?.data[currentPage - 1].publisher}</p>
            )}
            {foundBooks?.data[currentPage - 1].translator && (
              <p>Tłumacz: {foundBooks?.data[currentPage - 1].translator}</p>
            )}
            {foundBooks?.data[currentPage - 1].format && (
              <p>Format: {BookFormat[foundBooks?.data[currentPage - 1].format]}</p>
            )}
            {foundBooks?.data[currentPage - 1]?.pages && <p>Liczba stron: {foundBooks?.data[currentPage - 1].pages}</p>}
          </div>
          <div className="flex flex-col gap-4">
            {initialCheckForIsbnInProgress || checkForIsbnInProgress || bookExistsOnUserAccount ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex">
                    <Button
                      onClick={onAddBook}
                      size="xl"
                      disabled={initialCheckForIsbnInProgress || checkForIsbnInProgress || bookExistsOnUserAccount}
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
              <Button size="xl">Kontynuuj</Button>
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

  return (
    <AuthenticatedLayout>
      <div className="justify-center max-w-screen-xl mx-auto items-center w-full flex h-full min-h-[700px]">
        {render()}
      </div>
    </AuthenticatedLayout>
  );
};

const searchSchema = z.object({
  isbn: z.string().min(1).catch(''),
  title: z.string().min(1).catch(''),
  bookshelfId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/bookshelf/search/result/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchResultPage />
      </RequireAuthComponent>
    );
  },
  validateSearch: (search) => searchSchema.parse(search),
});
