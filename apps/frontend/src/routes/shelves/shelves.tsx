/* eslint-disable react-refresh/only-export-components */
import { FC } from 'react';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { useFindUserBookshelfsQuery } from '../../api/shelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';

export const ShelvesPage: FC = () => {
  const { data: user } = useFindUserQuery();

  const { data: bookshelves } = useFindUserBookshelfsQuery(user?.id);

  const navigate = useNavigate();

  // TODO: You have no bookshelves. Create one. - View
  // TODO: Fetch address by address once EP is available
  // TODO: Fetch a list of books on a shelf

  // const { accessToken } = useSelector(userStateSelectors.selectCurrentUserTokens) as {
  //   accessToken: string;
  //   refreshToken: string;
  // };

  // const queriesResponses = useQueries({
  //   queries:
  //     bookshelves?.data.map((bookshelf) => ({
  //       queryKey: ['findBooksByBookshelfId', bookshelf.id],
  //       queryFn: () =>
  //         findBooksByBookshelfId({
  //           accessToken,
  //           bookshelfId: bookshelf.id,
  //         }),
  //     })) ?? [],
  // });

  return (
    <AuthenticatedLayout>
      <div className="flex w-100% px-8 py-4">
        <div className="flex flex-col w-[100%] items-center justify-center">
          <h1 className="text-2xl sm:text-4xl font-bold capitalize">Moja biblioteka</h1>
          <div className="py-8 grid gap-4 grid-cols-2 w-[100%] min-h-32">
            {bookshelves?.data.map((bookshelf) => (
              <div
                key={`${bookshelf.id}`}
                className="flex rounded-sm border border-primary border-spacing-2 p-4 gap-x-2"
                onClick={() =>
                  navigate({
                    to: `/bookshelf/${bookshelf.id}`,
                  })
                }
              >
                <img
                  src={bookshelf?.imageUrl}
                  className="aspect-square max-w-56 object-cover"
                />
                <div
                  className="flex flex-col gap-y-4"
                  onClick={() => {
                    navigate({});
                  }}
                >
                  <h2 key={`${bookshelf.id}-${bookshelf.name}`}>{bookshelf.name}</h2>
                  <p key={`${bookshelf.id}-${bookshelf.address}`}>
                    {bookshelf.address}
                    {'  '}
                    {!bookshelf.address && 'Brak adresu'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const shelvesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shelves',
  component: () => {
    return (
      <RequireAuthComponent>
        <ShelvesPage />
      </RequireAuthComponent>
    );
  },
});
