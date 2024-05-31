import { FC } from 'react';
import { StarRating } from '../../components/starRating/starRating.js';
import { StatusChooserCards } from '../../components/statusChooser/statusChooserCards.js';
import { BookshelfChoiceDropdown } from '../../components/bookshelfChoiceDropdown/bookshelfChoiceDropdown.js';
import { Separator } from '../../../../components/ui/separator.js';
import { FavoriteBookButton } from '../../components/favoriteBookButton/favoriteBookButton.js';
import { useFindUserBookQuery } from '../../../../api/books/queries/findUserBook/findUserBookQuery.js';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery.js';
import { UserBook } from '@common/contracts';
import { BasicDataTabSkeleton } from './basicDataTabSkeleton.js';
import { CurrentRatingStar } from '../../components/currentRatingStar/currentRatingStar.js';

interface Props {
  bookId: string;
}

export const BasicDataTab: FC<Props> = ({ bookId }) => {
  const { data: userData } = useFindUserQuery();

  const { data, isFetched, isFetching, isRefetching } = useFindUserBookQuery({
    id: bookId,
    userId: userData?.id ?? '',
  });


  return (
    <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
      {isFetching && !isRefetching && <BasicDataTabSkeleton bookId={bookId} />}
      {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
        <>
          <div>
            <img
              src={data?.imageUrl}
              className="object-cover max-w-80"
            />
          </div>
          <div className="flex justify-center">
            <FavoriteBookButton
              userBook={data as UserBook}
              userId={userData?.id as string}
            />
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
                <p>Język: {data?.book.language}</p>
                <p>Tłumacz: {data?.book.translator}</p>
                <p>Format: {data?.book.format}</p>
                <p>Liczba stron: {data?.book.pages}</p>
                <p>Kategoria: {data?.genres[0]?.name}</p>
              </div>
              <div className="flex gap-12 flex-col items-end justify-start">
                <BookshelfChoiceDropdown bookId={data?.id ?? ''} />
                <div className="flex flex-col text-lg items-end gap-2">
                  <p>Status</p>
                  <StatusChooserCards bookId={data?.id ?? ''}></StatusChooserCards>
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
