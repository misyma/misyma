import { FC, useMemo } from 'react';
import { CurrentRatingStar } from '../currentRatingStar/currentRatingStar';
import { Separator } from '../../../common/components/separator/separator';
import { BookshelfChoiceDropdown } from '../bookshelfChoiceDropdown/bookshelfChoiceDropdown';
import { StatusChooserCards } from '../statusChooser/statusChooserCards';
import { StarRating } from '../../../bookReadings/components/starRating/starRating';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { ReversedLanguages } from '../../../common/constants/languages';
import { BookFormat } from '../../../common/constants/bookFormat';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';

interface BasicDataMainBodyProps {
  bookId: string;
}
export const BasicDataMainBody: FC<BasicDataMainBodyProps> = ({ bookId }) => {
  const { data: userData } = useFindUserQuery();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryOptions = useMemo(
    () =>
      FindUserBookByIdQueryOptions({
        userBookId: bookId,
        userId: userData?.id ?? '',
        accessToken: accessToken as string,
      }),
    [bookId, userData?.id, accessToken]
  );

  const { data, isFetching } = useErrorHandledQuery(queryOptions);

  const bookDetails = useMemo(
    () => ({
      language: data?.book.language
        ? ReversedLanguages[data?.book.language]?.toLowerCase()
        : '',
      format: data?.book.format ? BookFormat[data?.book.format] : '',
      title: data?.book.title,
      releaseYear: data?.book.releaseYear,
      pages: data?.book.pages,
      authors: data?.book.authors ?? [],
      genres: data?.genres ?? [],
      translator: data?.book.translator,
    }),
    [
      data?.book.language,
      data?.book.format,
      data?.book.title,
      data?.book.releaseYear,
      data?.book.pages,
      data?.book.authors,
      data?.genres,
      data?.book.translator,
    ]
  );
  return (
    <>
      <div className="flex flex-shrink-0 justify-between">
        {!isFetching && (
          <p className="font-semibold text-3xl w-1/2 block truncate">
            {bookDetails.title}
          </p>
        )}
        {isFetching && <Skeleton className="h-9 w-40" />}
        <CurrentRatingStar userBookId={bookId} />
      </div>
      <Separator className="h-[1px] bg-primary"></Separator>
      <div className="flex flex-shrink-0 w-full justify-between">
        <div className="flex flex-shrink-0 flex-col gap-2">
          <p className="text-lg pb-6">{bookDetails.authors[0]?.name}</p>
          {data?.book.isbn && <p>ISBN: {data?.book.isbn}</p>}
          {data?.book.releaseYear && (
            <p>Rok wydania: {bookDetails.releaseYear}</p>
          )}
          <p>Język: {bookDetails.language}</p>
          {data?.book.translator && <p>Przekład: {bookDetails.translator}</p>}
          <p>Format: {bookDetails.format}</p>
          {data?.book.pages && <p>Liczba stron: {bookDetails.pages}</p>}
          {data?.genres[0]?.name && (
            <p>Kategoria: {bookDetails.genres[0]?.name}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 gap-12 flex-col items-end justify-start">
          <BookshelfChoiceDropdown
            currentBookshelfId={data?.bookshelfId ?? ''}
            bookId={bookId}
          />
          <div className="flex flex-shrink-0 flex-col text-lg items-end gap-2">
            <p>Status</p>
            <StatusChooserCards
              bookshelfId={data?.bookshelfId ?? ''}
              bookId={data?.id ?? ''}
            ></StatusChooserCards>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p>Dodaj ocenę</p>
            <StarRating bookId={bookId}></StarRating>
          </div>
        </div>
      </div>
    </>
  );
};
