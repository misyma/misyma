import { FC, useMemo, useState } from 'react';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton';
import { UserBook } from '@common/contracts';
import { Separator } from '@radix-ui/react-select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { CurrentRatingStar } from '../../../../modules/book/components/currentRatingStar/currentRatingStar';
import { getQuotesOptions } from '../../../../modules/quotes/api/queries/getQuotes/getQuotesOptions';
import { QuotesApiQueryKeys } from '../../../../modules/quotes/api/queries/quotesApiQueryKeys';
import { cn } from '../../../../modules/common/lib/utils';
import { Button } from '../../../../modules/common/components/button/button';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { FindUserBookByIdQueryOptions } from '../../../../modules/book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { BasicDataTabSkeleton } from '../../../../modules/book/components/basicDataSkeleton/basicDataTabSkeleton';
import { useFindBookshelfByIdQuery } from '../../../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../../../modules/common/contexts/breadcrumbKeysContext';
import { CreateQuotationModal } from '../../../../modules/quotes/components/createQuotationModal/createQuotationModal';
import { QuotationsTable } from '../../../../modules/quotes/components/quotationsTable/quotationsTable';
import { columns } from '../../../../modules/quotes/components/quotationsTable/quotationsTableColumns';
import { BookImageMiniature } from '../../../../modules/book/components/bookImageMiniature/bookImageMiniature';

export const QuotesPage: FC = () => {
  const { data: userData } = useFindUserQuery();

  const { bookId } = Route.useParams();

  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);

  const dispatch = useBreadcrumbKeysDispatch();
  const breadcrumbKeys = useBreadcrumbKeysContext();

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
    })
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(
    userBookData?.bookshelfId as string
  );

  if (userBookData?.book.title && !breadcrumbKeys['$bookName']) {
    dispatch({
      key: '$bookName',
      value: userBookData?.book.title,
    });
  }

  if (!breadcrumbKeys['$bookId']) {
    dispatch({
      key: '$bookId',
      value: bookId,
    });
  }

  if (bookshelfResponse?.id && !breadcrumbKeys['$bookshelfName']) {
    dispatch({
      key: '$bookshelfName',
      value: bookshelfResponse.name,
    });

    dispatch({
      key: '$bookshelfId',
      value: userBookData?.bookshelfId,
    });
  }

  const {
    data: quotationsData,
    // isFetched: isQuotationsFetched,
    // isRefetching: isRefetchingQuotations,
    // isFetching: isQuotationsFetching,
  } = useQuery(
    getQuotesOptions({
      accessToken: accessToken as string,
      userBookId: bookId,
      page,
      pageSize,
    })
  );

  const pageCount = useMemo(() => {
    return Math.ceil((quotationsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [quotationsData?.metadata.total, pageSize]);

  const invalidateQuotesFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === QuotesApiQueryKeys.findQuotes &&
        query.queryKey[1] === bookId &&
        query.queryKey[2] === userData?.id &&
        query.queryKey[3] === `${page}` &&
        query.queryKey[4] === `${pageSize}`,
    });

  const onSetPage = (page: number): void => {
    setPage(page);

    invalidateQuotesFetch();
  };

  const data = useMemo(() => {
    return quotationsData?.data ?? [];
  }, [quotationsData?.data]);

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
                    to: `/book/tabs/basicDataTab/${bookId}`,
                  })
                }
              >
                Dane podstawowe
              </li>
              <li className={cn('cursor-default text-primary font-bold')}>
                Cytaty
              </li>
              <li
                className={cn('cursor-pointer')}
                onClick={() =>
                  navigate({
                    to: `/book/tabs/gradesTab/${bookId}`,
                  })
                }
              >
                Oceny
              </li>
            </ul>
            <CreateQuotationModal
              onMutated={() => {}}
              trigger={<Button size="xl">Dodaj cytat</Button>}
              userBookId={bookId}
            />
          </div>
          <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
            {isUserBookFetching && !isUserBookRefetching && (
              <BasicDataTabSkeleton bookId={bookId} />
            )}
            {isUserBookFetched &&
              (!isUserBookRefetching ||
                (isUserBookFetching && isUserBookRefetching)) && (
                <>
                  <div>
                    <BookImageMiniature
                      className="object-cover max-w-80"
                      userBook={userBookData}
                    />
                  </div>
                  <div className="flex justify-center">
                    <FavoriteBookButton userBook={userBookData as UserBook} />
                  </div>
                  <div className="flex flex-col gap-4 w-3/4">
                    <div className="flex justify-between w-full">
                      <p className="font-semibold text-3xl w-1/2 block truncate">
                        {userBookData?.book.title}
                      </p>
                      <CurrentRatingStar userBookId={bookId} />
                    </div>
                    <Separator className="h-[1px] bg-primary"></Separator>
                    <div className="flex flex-col w-full">
                      <p className="text-lg pb-6">
                        {' '}
                        {userBookData?.book?.authors[0]?.name ?? ''}{' '}
                      </p>
                      <QuotationsTable
                        columns={columns}
                        data={[...data]}
                        onSetPage={onSetPage}
                        pageCount={pageCount}
                        pageIndex={page}
                        pageSize={pageSize}
                        itemsCount={quotationsData?.metadata.total}
                      ></QuotationsTable>
                    </div>
                  </div>
                </>
              )}
          </div>{' '}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/book/tabs/quotationsTab/$bookId')({
  component: QuotesPage,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
      {
        readableName: '$bookshelfName',
        href: '/bookshelf/$bookshelfId',
      },
      {
        readableName: '$bookName',
        href: '/book/tabs/basicDataTab/$bookId',
      },
      {
        readableName: 'Cytaty',
        href: '/book/tabs/quotationsTab/$bookId',
      },
    ],
  },
});
