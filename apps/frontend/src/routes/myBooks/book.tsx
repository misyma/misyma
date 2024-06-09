import { Navigate, createRoute } from '@tanstack/react-router';
import { FC, useState } from 'react';
import { rootRoute } from '../root';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { Button } from '../../modules/common/components/ui/button';

import { BasicDataTab } from './tabs/basicDataTab/basicDataTab';
import { QuotationsTab } from './tabs/quotationsTab/quotationsTab';
import { GradesTab } from './tabs/gradesTab/gradesTab';
import { cn } from '../../modules/common/lib/utils';
import { CreateQuotationModal } from './components/createQuotationModal/createQuotationModal';
import { AddStarRatingButton } from './components/addStarRatingButton/addStarRatingButton';
import { useQueryClient } from '@tanstack/react-query';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { EditOrDeleteBookModal } from './components/editOrDeleteBookModal/editOrDeleteBookModal';

export const BookPage: FC = () => {
  const { data: userData } = useFindUserQuery();

  const { bookId } = bookRoute.useParams();

  const queryClient = useQueryClient();

  const tabMap = {
    basicData: BasicDataTab,
    quotations: QuotationsTab,
    grades: GradesTab,
  };

  const [currentTab, setCurrentTab] = useState<keyof typeof tabMap>('basicData');

  const setTab = (tab: keyof typeof tabMap) => {
    if (currentTab === tab) return;

    setCurrentTab(tab);
  };

  const invalidateReadingsFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === `findBookReadings` && query.queryKey[1] === userData?.id && query.queryKey[2] === bookId,
    });

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="col-span-2 sm:col-start-1 sm:col-span-5 flex justify-between">
            {/* sm:visible otherwise dropdown component visible */}
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <li
                className={cn(
                  'cursor-pointer',
                  currentTab === 'basicData' ? 'cursor-default text-primary font-bold' : '',
                )}
                onClick={() => setTab('basicData')}
              >
                Dane podstawowe
              </li>
              <li
                className={cn(
                  'cursor-pointer',
                  currentTab === 'quotations' ? 'cursor-default text-primary font-bold' : '',
                )}
                onClick={() => setTab('quotations')}
              >
                Cytaty
              </li>
              <li
                className={cn('cursor-pointer', currentTab === 'grades' ? 'cursor-default text-primary font-bold' : '')}
                onClick={() => setTab('grades')}
              >
                Oceny
              </li>
            </ul>
            {currentTab === 'basicData' ? (
              <EditOrDeleteBookModal
                bookId={bookId}
                userBookId={bookId}
              />
            ) : currentTab === 'grades' ? (
              <div className="flex gap-1 justify-center items-end flex-col">
                <p>Dodaj ocenę</p>

                <AddStarRatingButton
                  onCreated={async () => await invalidateReadingsFetch()}
                  userBookId={bookId}
                />
              </div>
            ) : currentTab === 'quotations' ? (
              <CreateQuotationModal
                onMutated={() => {}}
                trigger={<Button className="w-32 sm:w-96">Dodaj cytat</Button>}
                userBookId={bookId}
              />
            ) : null}
          </div>
          {currentTab === 'basicData' ? (
            <BasicDataTab bookId={bookId}></BasicDataTab>
          ) : currentTab === 'grades' ? (
            <GradesTab userBookId={bookId} />
          ) : currentTab === 'quotations' ? (
            <QuotationsTab userBookId={bookId} />
          ) : null}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$bookId',
  component: BookPage,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
});
