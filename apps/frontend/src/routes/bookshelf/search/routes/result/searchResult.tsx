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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../components/ui/pagination';

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
      <div className="items-center justify-center flex-col-reverse sm:flex-row gap-4 sm:gap-16 px-16
      grid grid-rows-2 grid-cols-1 sm:grid-cols-2 sm:grid-rows-1
      ">
        <div className="flex flex-col gap-12 w-full">
          {booksCount > 1 ? (
            <div className="w-full flex items-center justify-center text-primary font-semibold text-lg sm:text-2xl">
              {currentPage} z {booksCount}
            </div>
          ) : (
            <></>
          )}
          <div className="flex w-full">
            <Pagination className='w-full text-xl sm:text-3xl justify-normal'>
              <PaginationContent className='w-full'>
                <PaginationItem>
                  {booksCount > 1 ? (
                    <PaginationPrevious
                      className={currentPage === 1 ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''}
                      hasPrevious={currentPage !== 1}
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                    ></PaginationPrevious>
                  ) : (
                    <></>
                  )}
                </PaginationItem>
                <span className='text-ellipsis w-full line-clamp-2'>{foundBooks?.data[currentPage - 1].title}</span>
                <PaginationItem>
                  {booksCount > 1 ? (
                    <PaginationNext
                      className={
                        currentPage === booksCount ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''
                      }
                      hasNext={currentPage !== booksCount}
                      onClick={() => {
                        if (currentPage < booksCount) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                    ></PaginationNext>
                  ) : (
                    <></>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p>{foundBooks?.data[currentPage - 1]?.authors[0]?.name ?? ''}</p>
          </div>
          <div className="border border-gray-400 w-full translate-x-[-1rem] sm:translate-x-[-2rem] px-4"></div>
          <div className="flex flex-col gap-2 w-full">
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
        <div className="flex max-w-[500px] sm:min-h-[550px] items-center">
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
      <div className='flex items-center justify-center'>
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
