import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../../../../root';
import { RequireAuthComponent } from '../../../../../modules/core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { FC, useEffect, useMemo, useState } from 'react';
import { FindBooksQueryOptions } from '../../../../../modules/book/api/queries/findBooks/findBooksQueryOptions';
import { AuthenticatedLayout } from '../../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../../../../../modules/common/components/ui/button';
import { useSearchBookContextDispatch } from '../../../../../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { Book } from '../../../../../../../../common/contracts/dist/src/schemas/book/book';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../../modules/core/store/states/userState/userStateSlice';
import { Paginator } from '../../../../../modules/common/components/paginator/paginator';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../../modules/common/components/ui/breadcrumbs';
import { LoadingSpinner } from '../../../../../modules/common/components/spinner/loading-spinner';

export const SearchResultPage: FC = () => {
  const searchParams = searchResultRoute.useSearch();

  const navigate = useNavigate();

  const searchCreationDispatch = useSearchBookContextDispatch();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  useEffect(() => {
    if (searchParams.isbn === '' && searchParams.title === '') {
      navigate({
        to: '/search',
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

  const onTryAgain = () => {
    navigate({
      to: '/search',
      search: {
        bookshelfId: searchParams.bookshelfId,
      },
    });
  };

  const onCreateManually = () => {
    navigate({
      to: `/manually-create-book/${searchParams.bookshelfId}`,
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
      to: `/search/create/${searchParams.bookshelfId}`,
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
                onClick={onCreateManually}
                className="w-[70%]"
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
                onPageChange={(page) => setCurrentPage(page)}
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
            <p>ISBN: {foundBooks?.data[currentPage - 1].isbn}</p>
            <p>Rok wydania: {foundBooks?.data[currentPage - 1].releaseYear}</p>
            <p>Język: {foundBooks?.data[currentPage - 1].language}</p>
            <p>Wydawnictwo: {foundBooks?.data[currentPage - 1].publisher}</p>
            <p>Tłumacz: {foundBooks?.data[currentPage - 1].translator}</p>
            <p>Format: {foundBooks?.data[currentPage - 1].format}</p>
            <p>Liczba stron: {foundBooks?.data[currentPage - 1].pages}</p>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              onClick={onAddBook}
              className="w-60 sm:w-96"
            >
              Kontynuuj
            </Button>
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
    return <AuthenticatedLayout>
      <div className='justify-center max-w-screen-xl mx-auto items-center w-full flex h-full min-h-[700px]'>
        <LoadingSpinner></LoadingSpinner>
      </div>
    </AuthenticatedLayout>
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

export const searchResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/result',
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchResultPage />
      </RequireAuthComponent>
    );
  },
  validateSearch: (search) => searchSchema.parse(search),
});
