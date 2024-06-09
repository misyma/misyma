import { FC, useMemo, useState } from 'react';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery';
import { BasicDataTabSkeleton } from '../basicDataTab/basicDataTabSkeleton';
import { FavoriteBookButton } from '../../components/favoriteBookButton/favoriteBookButton';
import { UserBook } from '@common/contracts';
import { Separator } from '@radix-ui/react-select';
import { QuotationsTable } from '../../components/quotationsTable/quotationsTable';
import { columns } from '../../components/quotationsTable/quotationsTableColumns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { CurrentRatingStar } from '../../components/currentRatingStar/currentRatingStar';
import { FindUserBookQueryOptions } from '../../../../modules/book/api/queries/findUserBook/findUserBookQueryOptions';
import { getQuotesOptions } from '../../../../modules/quotes/api/queries/getQuotes/getQuotesOptions';

interface Props {
  userBookId: string;
}

export const QuotationsTab: FC<Props> = ({ userBookId }) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const [page, setPage] = useState(0);

  const [pageSize] = useState(4);

  const {
    data: userBookData,
    isFetched: isUserBookFetched,
    isFetching: isUserBookFetching,
    isRefetching: isUserBookRefetching,
  } = useQuery(
    FindUserBookQueryOptions({
      userBookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const {
    data: quotationsData,
    // isFetched: isQuotationsFetched,
    // isRefetching: isRefetchingQuotations,
    // isFetching: isQuotationsFetching,
  } = useQuery(
    getQuotesOptions({
      accessToken: accessToken as string,
      userBookId,
      page,
      pageSize,
    }),
  );

  const pageCount = useMemo(() => {
    return Math.ceil((quotationsData?.metadata?.total ?? 0) / pageSize) || 1;
  }, [quotationsData?.metadata.total, pageSize]);

  const invalidateQuotesFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === `findQuotes` &&
        query.queryKey[1] === userBookId &&
        query.queryKey[2] === userData?.id &&
        query.queryKey[3] === `${page}` &&
        query.queryKey[4] === `${pageSize}`,
    });

  const onNextPage = (): void => {
    setPage(page + 1);

    invalidateQuotesFetch();
  };

  const onSetPage = (page: number): void => {
    setPage(page);

    invalidateQuotesFetch();
  };

  const onPreviousPage = (): void => {
    setPage(page - 1);

    invalidateQuotesFetch();
  };

  return (
    <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
      {isUserBookFetching && !isUserBookRefetching && <BasicDataTabSkeleton bookId={userBookId} />}
      {isUserBookFetched && (!isUserBookRefetching || (isUserBookFetching && isUserBookRefetching)) && (
        <>
          <div>
            <img
              src={userBookData?.imageUrl}
              className="object-cover max-w-80"
            />
          </div>
          <div className="flex justify-center">
            <FavoriteBookButton userBook={userBookData as UserBook} />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <p className="font-semibold text-3xl">{userBookData?.book.title}</p>
              <CurrentRatingStar userBookId={userBookId} />
            </div>
            <Separator className="h-[1px] bg-primary"></Separator>
            <div className="flex flex-col w-full">
              <p className="text-lg pb-6"> {userBookData?.book.authors[0].name ?? ''} </p>
              <QuotationsTable
                columns={columns}
                data={quotationsData?.data ?? []}
                onNextPage={onNextPage}
                onPreviousPage={onPreviousPage}
                onSetPage={onSetPage}
                pageCount={pageCount}
                pageIndex={page}
                pageSize={pageSize}
              ></QuotationsTable>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
