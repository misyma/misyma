/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../../../../root';
import { FC, useEffect } from 'react';
import { RequireAuthComponent } from '../../../../../core/components/requireAuth/requireAuthComponent';
import { useSearchBookContext } from '../../context/searchCreateBookContext';
import { ManualStep } from '../../components/manualStep/manualStep';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../../components/ui/breadcrumbs';
import { AuthenticatedLayout } from '../../../../../layouts/authenticated/authenticatedLayout';

export const SearchCreatePage: FC = () => {
  const searchBookContext = useSearchBookContext();

  const searchParams = searchCreateRoute.useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.bookshelfId === '') {
      navigate({
        to: '/shelves',
      });
    }

    if (searchBookContext.step !== 3) {
      navigate({
        to: '/search',
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
        {/* eslint-disable-next-line */}
        <ManualStep bookshelfId={(searchParams.bookshelfId)} />
      </div>
      <div className="flex max-w-[250px] w-full sm:max-w-[500px] sm:min-h-[550px] justify-center items-center">
        <img
          src="/books.png"
          alt="Books image"
          className="object-contain"
        />
      </div>
    </div>

    </AuthenticatedLayout>
  );
};

export const searchCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search/create/$bookshelfId',
  component: () => {
    return (
      <RequireAuthComponent>
        <SearchCreatePage />
      </RequireAuthComponent>
    );
  },
});
