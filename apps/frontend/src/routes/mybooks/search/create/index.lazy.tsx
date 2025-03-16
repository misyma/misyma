import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { type FC, useEffect } from 'react';

import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { ManualStep } from '../../../../modules/book/components/organisms/manualStep/manualStep';
import { useSearchBookContext } from '../../../../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../modules/common/components/ui/breadcrumbs';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';

export const SearchCreatePage: FC = () => {
  const searchBookContext = useSearchBookContext();

  // TODO: fix
  const params = Route.useParams() as { bookshelfId: string };

  const navigate = useNavigate();

  useEffect(() => {
    if (searchBookContext.step !== 3) {
      navigate({
        to: '/shelves/bookshelf/search',
        search: {
          bookshelfId: params.bookshelfId,
          next: 0,
          type: 'title',
        },
      });

      return;
    }

    if (searchBookContext.bookId === undefined) {
      navigate({
        to: '/mybooks',
      });

      return;
    }

    if (searchBookContext.title === undefined) {
      navigate({
        to: '/mybooks',
      });

      return;
    }
  }, [navigate, params.bookshelfId, searchBookContext.title, searchBookContext.bookId, searchBookContext.step]);

  //   return <ManualStep bookshelfId={searchParams.bookshelfId}></ManualStep>;

  return (
    <AuthenticatedLayout>
      <div className="w-full flex items-center justify-center">
        <div className="flex flex-col-reverse sm:px-10 pt-8 sm:pt-24 sm:flex-row gap-10 sm:gap-20 md:gap-30 lg:gap-60 max-w-[15rem] sm:max-w-[unset]">
          <div className="sm:min-h-[40rem]">
            <Breadcrumbs
              crumbs={{
                [1]: <NumericBreadcrumb index={1}>1</NumericBreadcrumb>,
                [2]: <NumericBreadcrumb index={2}>2</NumericBreadcrumb>,
                [3]: (
                  <NumericBreadcrumb
                    index={3}
                    className="font-semibold bg-primary text-white border-primary"
                  >
                    3
                  </NumericBreadcrumb>
                ),
              }}
            />
            {}
            <ManualStep
              navigateTo="shelves"
              bookshelfId={params.bookshelfId}
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full flex justify-center items-center h-[500px] md:h-[300px]">
              <img
                src="/books.png"
                alt="Books image"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createLazyFileRoute('/mybooks/search/create/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchCreatePage />
      </RequireAuthComponent>
    );
  },
});
