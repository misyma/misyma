import { FC, useMemo, useState } from 'react';
import { Separator } from '../../../../modules/common/components/ui/separator.js';
import { FindUserBookByIdQueryOptions } from '../../../../modules/book/api/queries/findUserBook/findUserBookByIdQueryOptions.js';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery.js';
import { UserBook } from '@common/contracts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice.js';
import { CurrentRatingStar } from '../../../../modules/book/components/currentRatingStar/currentRatingStar.js';
import { BasicDataTabSkeleton } from '../basicDataTab/basicDataTabSkeleton.js';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';
import { FindBookReadingsQueryOptions } from '../../../../modules/bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions.js';
import { GradesTable } from '../../../../modules/book/components/gradesTable/gradesTable.js';
import { columns } from '../../../../modules/book/components/gradesTable/gradesTableColumns.js';
import { BookReadingsApiQueryKeys } from '../../../../modules/bookReadings/api/queries/bookReadingsApiQueryKeys.js';
import { AddStarRatingButton } from '../../../../modules/book/components/addStarRatingButton/addStarRatingButton.js';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout.js';
import { Navigate, createRoute, useNavigate } from '@tanstack/react-router';
import { cn } from '../../../../modules/common/lib/utils.js';
import { rootRoute } from '../../../root.js';
import { z } from 'zod';

export const GradesPage: FC = () => {
  const { bookId } = gradesTabPage.useParams();

  const { data: userData } = useFindUserQuery();

  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [pageSize] = useState(4);

  const [page, setPage] = useState(0);

  const { data: bookReadings } = useQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: bookId,
      page,
      pageSize,
    }),
  );

  const pageCount = useMemo(() => {
    return Math.ceil((bookReadings?.metadata?.total ?? 0) / pageSize) || 1;
  }, [bookReadings?.metadata.total, pageSize]);

  const {
    data: userBookData,
    isFetched: isUserBookFetched,
    isFetching: isUserBookFetching,
    isRefetching: isUserBookRefetching,
  } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const invalidateReadingsFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === BookReadingsApiQueryKeys.findBookReadings &&
        query.queryKey[1] === userData?.id &&
        query.queryKey[2] === bookId,
    });

  const onNextPage = (): void => {
    setPage(page + 1);

    invalidateReadingsFetch();
  };

  const onSetPage = (page: number): void => {
    setPage(page);

    invalidateReadingsFetch();
  };

  const onPreviousPage = (): void => {
    setPage(page - 1);

    invalidateReadingsFetch();
  };

  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      {bookId === '' ? <Navigate to={'/login'} /> : null}
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
          <div className="col-span-2 sm:col-start-1 sm:col-span-5 flex justify-between">
            {/* sm:visible otherwise dropdown component visible */}
            <ul className="flex justify-between gap-8 text-sm sm:text-lg font-semibold">
              <li
                className={cn('cursor-pointer')}
                onClick={() =>
                  navigate({
                    to: `/book/${bookId}`,
                  })
                }
              >
                Dane podstawowe
              </li>
              <li
                className={cn('cursor-pointer')}
                onClick={() =>
                  navigate({
                    to: `/book/${bookId}/quotations`,
                  })
                }
              >
                Cytaty
              </li>
              <li className={cn('cursor-default text-primary font-bold')}>Oceny</li>
            </ul>
            <div className="flex justify-center items-end flex-col">
              <p>Dodaj ocenę</p>
              <AddStarRatingButton
                onCreated={async () => await invalidateReadingsFetch()}
                userBookId={bookId}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
            {isUserBookFetching && !isUserBookRefetching && <BasicDataTabSkeleton bookId={bookId} />}
            {isUserBookFetched && (!isUserBookRefetching || (isUserBookFetching && isUserBookRefetching)) && (
              <>
                <div>
                  <img
                    src={userBookData?.imageUrl || '/book.jpg'}
                    className="object-cover max-w-80"
                  />
                </div>
                <div className="flex justify-center">
                  <FavoriteBookButton userBook={userBookData as UserBook} />
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full">
                    <p className="font-semibold text-3xl">{userBookData?.book.title}</p>
                    <CurrentRatingStar userBookId={bookId} />
                  </div>
                  <Separator className="h-[1px] bg-primary"></Separator>
                  <div className="flex flex-col w-full">
                    <p className="text-lg pb-6"> {userBookData?.book?.authors[0]?.name ?? ''} </p>
                    <GradesTable
                      columns={columns}
                      data={bookReadings?.data ?? []}
                      onNextPage={onNextPage}
                      onPreviousPage={onPreviousPage}
                      onSetPage={onSetPage}
                      pageCount={pageCount}
                      pageIndex={page}
                      pageSize={pageSize}
                    ></GradesTable>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const gradesTabPage = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$bookId/reviews',
  component: GradesPage,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
});
