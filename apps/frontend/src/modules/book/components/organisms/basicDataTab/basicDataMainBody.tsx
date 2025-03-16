import { type FC, useMemo } from 'react';

import { StarRating } from '../../../../bookReadings/components/starRating/starRating';
import { Separator } from '../../../../common/components/separator/separator';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { BookFormat } from '../../../../common/constants/bookFormat';
import { ReversedLanguages } from '../../../../common/constants/languages';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { BookTitle } from '../../../../quotes/components/atoms/bookTitle/bookTitle';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { BookshelfChoiceDropdown } from '../../molecules/bookshelfChoiceDropdown/bookshelfChoiceDropdown';
import { CurrentRatingStar } from '../../molecules/currentRatingStar/currentRatingStar';
import { StatusChooserCards } from '../../molecules/statusChooser/statusChooserCards';

interface BasicDataMainBodyProps {
  bookId: string;
}

export const BasicDataMainBody: FC<BasicDataMainBodyProps> = ({ bookId }) => {
  const queryOptions = useMemo(
    () =>
      FindUserBookByIdQueryOptions({
        userBookId: bookId,
      }),
    [bookId],
  );

  const { data, isLoading } = useErrorHandledQuery(queryOptions);

  const bookDetails = useMemo(
    () => ({
      language: data?.book.language ? ReversedLanguages[data.book.language]?.toLowerCase() : '',
      format: data?.book.format ? BookFormat[data.book.format] : '',
      title: data?.book.title,
      releaseYear: data?.book.releaseYear,
      pages: data?.book.pages,
      authors: data?.book.authors ?? [],
      genre: data?.genreName,
      translator: data?.book.translator,
    }),
    [
      data?.book.language,
      data?.book.format,
      data?.book.title,
      data?.book.releaseYear,
      data?.book.pages,
      data?.book.authors,
      data?.genreName,
      data?.book.translator,
    ],
  );

  return (
    <>
      <div className="flex flex-shrink-0 justify-between">
        {!isLoading && <BookTitle title={bookDetails.title ?? ''} />}
        {isLoading && <Skeleton className="h-9 w-40" />}
        <CurrentRatingStar userBookId={bookId} />
      </div>
      <Separator className="h-[1px] bg-primary" />
      <div className="flex flex-shrink-0 w-full justify-between">
        <div className="flex flex-shrink-0 flex-col gap-2">
          <p className="text-lg pb-6">
            {!isLoading && (bookDetails.authors.length > 1 ? <p>Autorzy: </p> : <p>Autor: </p>)}
            {bookDetails.authors.slice(0, 3).map((author, index) => (
              <span key={index}>
                {author.name}
                {index < Math.min(bookDetails.authors.length, 3) - 1 && ', '}
              </span>
            ))}
            {bookDetails.authors.length > 3 && ` i ${bookDetails.authors.length - 3} więcej`}
          </p>{' '}
          {data?.book.isbn && <p>ISBN: {data.book.isbn}</p>}
          {data?.book.releaseYear && <p>Rok wydania: {bookDetails.releaseYear}</p>}
          <p>Język: {bookDetails.language}</p>
          {data?.book.translator && <p>Przekład: {bookDetails.translator}</p>}
          <p>Format: {bookDetails.format}</p>
          {data?.book.pages && <p>Liczba stron: {bookDetails.pages}</p>}
          {data?.genreName && <p>Kategoria: {bookDetails.genre}</p>}
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
            />
          </div>
          <div className="flex flex-col items-end gap-2">
            <p>Dodaj ocenę</p>
            <StarRating bookId={bookId} />
          </div>
        </div>
      </div>
    </>
  );
};
