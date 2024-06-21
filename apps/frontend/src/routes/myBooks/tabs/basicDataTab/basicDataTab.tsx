import { FC, useMemo } from 'react';
import { StarRating } from '../../../../modules/bookReadings/components/starRating/starRating.js';
import { StatusChooserCards } from '../../../../modules/book/components/statusChooser/statusChooserCards.js';
import { BookshelfChoiceDropdown } from '../../../../modules/book/components/bookshelfChoiceDropdown/bookshelfChoiceDropdown.js';
import { Separator } from '../../../../modules/common/components/ui/separator.js';
import { FavoriteBookButton } from '../../../../modules/book/components/favoriteBookButton/favoriteBookButton.js';
import { FindUserBookByIdQueryOptions } from '../../../../modules/book/api/queries/findUserBook/findUserBookByIdQueryOptions.js';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery.js';
import { UserBook } from '@common/contracts';
import { BasicDataTabSkeleton } from './basicDataTabSkeleton.js';
import { CurrentRatingStar } from '../../../../modules/book/components/currentRatingStar/currentRatingStar.js';
import { BookFormat } from '../../../../modules/common/constants/bookFormat.js';
import { ReversedLanguages } from '../../../../modules/common/constants/languages.js';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice.js';

interface Props {
  bookId: string;
}

export const BasicDataTab: FC<Props> = ({ bookId }) => {
  const { data: userData } = useFindUserQuery();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data, isFetched, isFetching, isRefetching } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const imageUrl = useMemo(() => data?.imageUrl, [data?.imageUrl]);

  return (
    <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
      {isFetching && !isRefetching && <BasicDataTabSkeleton bookId={bookId} />}
      {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
        <>
          <div>
            <img
              key={`${imageUrl}`}
              src={imageUrl}
              className="object-cover max-w-80"
            />
          </div>
          <div className="flex justify-center">
            <FavoriteBookButton userBook={data as UserBook} />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <p className="font-semibold text-3xl">{data?.book.title}</p>
              <CurrentRatingStar userBookId={bookId} />
            </div>
            <Separator className="h-[1px] bg-primary"></Separator>
            <div className="flex w-full justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-lg pb-6">{data?.book.authors[0]?.name}</p>
                <p>ISBN: {data?.book.isbn}</p>
                <p>Rok wydania: {data?.book.releaseYear}</p>
                <p>Język: {data?.book.language ? ReversedLanguages[data?.book.language]?.toLowerCase() : ''}</p>
                <p>Tłumacz: {data?.book.translator}</p>
                <p>Format: {data?.book.format ? BookFormat[data?.book.format] : ''}</p>
                <p>Liczba stron: {data?.book.pages}</p>
                <p>Kategoria: {data?.genres[0]?.name}</p>
              </div>
              <div className="flex gap-12 flex-col items-end justify-start">
                <BookshelfChoiceDropdown
                  currentBookshelfId={data?.bookshelfId ?? ''}
                  bookId={data?.id ?? ''}
                />
                <div className="flex flex-col text-lg items-end gap-2">
                  <p>Status</p>
                  <StatusChooserCards
                    bookshelfId={data?.bookshelfId ?? ''}
                    bookId={data?.id ?? ''}
                  ></StatusChooserCards>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p>Dodaj ocenę</p>
                  <StarRating bookId={data?.id ?? ''}></StarRating>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
