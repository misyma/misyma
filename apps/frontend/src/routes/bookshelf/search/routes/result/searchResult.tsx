/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../../../../root';
import { RequireAuthComponent } from '../../../../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { FC, useEffect } from 'react';
import { useFindBooksQuery } from '../../../../../api/books/queries/findBooks/findBooksQuery';
import { AuthenticatedLayout } from '../../../../../layouts/authenticated/authenticatedLayout';
import { Button } from '../../../../../components/ui/button';
import { useCreateUserBookMutation } from '../../../../../api/books/mutations/createUserBookMutation/createUserBookMutation';
import { useFindUserQuery } from '../../../../../api/user/queries/findUserQuery/findUserQuery';
import { ReadingStatus } from '@common/contracts';
import { BookApiError } from '../../../../../api/books/errors/bookApiError';
import { useToast } from '../../../../../components/ui/use-toast';

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
      <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-8 sm:gap-16 px-4">
        <div className="flex flex-col gap-12 items-start relative">
          <div>
            <p className="text-xl sm:text-3xl">{foundBooks?.data[0].title}</p>
            <p>{foundBooks?.data[0]?.authors[0]?.name ?? ''}</p>
          </div>
          <div className="border border-gray-400 sm:min-w-[28rem] min-w-[16rem] absolute translate-y-14 sm:translate-y-16 translate-x-[-1rem] sm:translate-x-[-2rem] px-4"></div>
          <div className="flex flex-col gap-2">
            <p>Wydawnictwo: {foundBooks?.data[0].publisher}</p>
            <p>Tłumacz: {foundBooks?.data[0].translator}</p>
            <p>Format: {foundBooks?.data[0].format}</p>
            <p>Liczba stron: {foundBooks?.data[0].pages}</p>
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
              <h1 className="text-3xl font-bold">POCZEBUJEMY INPUTU POD STATUS</h1>
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
  };

  return (
    <AuthenticatedLayout>
      <div className="flex justify-center items-center">{render()}</div>
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
