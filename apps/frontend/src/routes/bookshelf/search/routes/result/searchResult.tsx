/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../../../../root';
import { RequireAuthComponent } from '../../../../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { FC, useEffect, useMemo, useState } from 'react';
import { useFindBooksQuery } from '../../../../../api/books/queries/findBooks/findBooksQuery';
import { AuthenticatedLayout } from '../../../../../layouts/authenticated/authenticatedLayout';
import { Button } from '../../../../../components/ui/button';
import { useCreateUserBookMutation } from '../../../../../api/books/mutations/createUserBookMutation/createUserBookMutation';
import { useFindUserQuery } from '../../../../../api/user/queries/findUserQuery/findUserQuery';
import { ReadingStatus } from '@common/contracts';
import { BookApiError } from '../../../../../api/books/errors/bookApiError';
import { useToast } from '../../../../../components/ui/use-toast';
import { Paginator } from '../../../../../components/paginator/paginator';

export const SearchResultPage: FC = () => {
  const searchParams = searchResultRoute.useSearch();

  const navigate = useNavigate();

  const { data: user } = useFindUserQuery();

  const { toast } = useToast();

  const { mutateAsync: createUserBookMutation } = useCreateUserBookMutation({});

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

  const { data: foundBooks } = useFindBooksQuery({
    title: searchParams.title,
    isbn: searchParams.isbn,
  });

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
    try {
      await createUserBookMutation({
        bookId: foundBooks?.data[0].id as string,
        bookshelfId: searchParams.bookshelfId,
        status: ReadingStatus.toRead,
        userId: user?.id as string,
        isFavorite: false,
      });

      toast({
        title: 'Książka została położona na półce 😄',
        description: `Książka ${foundBooks?.data[0]?.title} została położona na półce 😄`,
        variant: 'success',
      });

      navigate({
        to: `/bookshelf/${searchParams.bookshelfId}`,
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        toast({
          title: 'Coś poszło nie tak...',
          description: 'Nie udało się utworzyć książki. Spróbuj ponownie.',
          variant: 'destructive',
        });

        return;
      }

      toast({
        title: 'Coś poszło nie tak...',
        description: 'Nie udało się utworzyć książki. Spróbuj ponownie.',
        variant: 'destructive',
      });
    }
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
        <div className="w-full flex flex-col gap-8 px-8 sm:pr-0 sm:pl-8">
          {booksCount > 1 ? (
            <div className="full flex justify-center">
              <span className="font-bold text-2xl text-primary">
                {currentPage} z {booksCount}
              </span>
            </div>
          ) : (
            <></>
          )}
          <div className="flex w-full">
            <Paginator
              rootClassName="w-full flex items-center h-16 text-xl sm:text-3xl justify-normal"
              onPageChange={(page) => setCurrentPage(page)}
              pagesCount={booksCount}
              pageNumberSlot={
                <span className='text-center text-ellipsis w-full line-clamp-2'>{foundBooks?.data[currentPage - 1].title}</span>
              }
              contentClassName='w-full'
            />
            <p>{foundBooks?.data[currentPage - 1]?.authors[0]?.name ?? ''}</p>
          </div>
          <div className="border border-gray-400 w-full lg:translate-x-[-2rem] px-4"></div>
          <div className="flex flex-col gap-4 w-full">
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
              Dodaj książkę
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
            {/* <span className="text-3xl font-bold">POCZEBUJEMY INPUTU POD STATUS</span> */}
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
