import { FC, useMemo, useState } from 'react';
import { Separator } from '../../../../modules/common/components/ui/separator.js';
import { FindUserBookQueryOptions } from '../../../../modules/book/api/queries/findUserBook/findUserBookQueryOptions.js';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery.js';
import { UserBook } from '@common/contracts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice.js';
import { CurrentRatingStar } from '../../components/currentRatingStar/currentRatingStar.js';
import { BasicDataTabSkeleton } from '../basicDataTab/basicDataTabSkeleton.js';
import { columns } from '../../components/gradesTable/gradesTableColumns.js';
import { GradesTable } from '../../components/gradesTable/gradesTable.js';
import { FavoriteBookButton } from '../../components/favoriteBookButton/favoriteBookButton.js';
import { FindBookReadingsQueryOptions } from '../../../../modules/bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions.js';

interface Props {
  userBookId: string;
}

export const GradesTab: FC<Props> = ({ userBookId }) => {
  const { data: userData } = useFindUserQuery();

  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookReadings } = useQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: userBookId,
    }),
  );

  const [pageSize] = useState(4);

  const [page, setPage] = useState(0);

  const pageCount = useMemo(() => {
    return Math.ceil((bookReadings?.metadata?.total ?? 0) / pageSize) || 1;
  }, [bookReadings?.metadata.total, pageSize]);

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

  const invalidateReadingsFetch = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === `findBookReadings` &&
        query.queryKey[1] === userData?.id &&
        query.queryKey[2] === userBookId,
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
  );
};
