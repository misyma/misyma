import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { RequireAuthComponent } from '../../../../modules/core/components/requireAuth/requireAuthComponent';
import { useSearchBookContext } from '../../../../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { ManualStep } from '../../../../modules/bookshelf/components/manualStep/manualStep';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../modules/common/components/ui/breadcrumbs';

export const SearchCreatePage: FC = () => {
  const searchBookContext = useSearchBookContext();

  const searchParams = Route.useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.bookshelfId === '') {
      navigate({
        to: '/shelves',
      });

      return;
    }

    if (searchBookContext.step !== 3) {
      navigate({
        to: '/bookshelf/search',
        search: {
          bookshelfId: searchParams.bookshelfId,
          next: 0,
          type: 'title',
        },
      });

      return;
    }

    if (searchBookContext.bookId === undefined) {
      navigate({
        to: '/shelves',
      });

      return;
    }

    if (searchBookContext.title === undefined) {
      navigate({
        to: '/shelves',
      });

      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //   return <ManualStep bookshelfId={searchParams.bookshelfId}></ManualStep>;

  return (
    <AuthenticatedLayout>
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
          <ManualStep bookshelfId={searchParams.bookshelfId} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/bookshelf/search/create/$bookshelfId')({
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchCreatePage />
      </RequireAuthComponent>
    );
  },
});
