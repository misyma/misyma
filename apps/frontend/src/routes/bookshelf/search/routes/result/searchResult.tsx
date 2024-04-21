/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../../../../root';
import { RequireAuthComponent } from '../../../../../core/components/requireAuth/requireAuthComponent';
import { z } from 'zod';
import { FC, useEffect } from 'react';
import { useFindBooksQuery } from '../../../../../api/books/queries/findBooks/findBooksQuery';
import { AuthenticatedLayout } from '../../../../../layouts/authenticated/authenticatedLayout';
import { FindBooksResponseBody } from '@common/contracts';
import { Button } from '../../../../../components/ui/button';

export const SearchResultPage: FC = () => {
  const searchParams = searchResultRoute.useSearch();

  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.isbn === '' && searchParams.title === '') {
      navigate({
        to: 'search',
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
    });
  };

  const render = () => {
    if ((foundBooks as FindBooksResponseBody)?.data.length === 0) {
      return (
        <div className="flex justify-center items-center">
          <div className="flex flex-col gap-12 max-w-[38rem]">
            <span className="font-semibold text-xl sm:text-3xl">
              Nie możemy znaleźć danych dla podanego przez Ciebie tytułu
            </span>
            <div className="flex flex-col gap-4">
              <Button className="w-[70%]">Wprowadź dane</Button>
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

    return;
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
