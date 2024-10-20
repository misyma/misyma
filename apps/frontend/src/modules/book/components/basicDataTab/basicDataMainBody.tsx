import { FC } from 'react';
import { CurrentRatingStar } from '../currentRatingStar/currentRatingStar';
import { Separator } from '../../../common/components/separator/separator';
import { BookshelfChoiceDropdown } from '../bookshelfChoiceDropdown/bookshelfChoiceDropdown';
import { StatusChooserCards } from '../statusChooser/statusChooserCards';
import { StarRating } from '../../../bookReadings/components/starRating/starRating';
import { useQuery } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { ReversedLanguages } from '../../../common/constants/languages';
import { BookFormat } from '../../../common/constants/bookFormat';

interface BasicDataMainBodyProps {
  bookId: string;
}
export const BasicDataMainBody: FC<BasicDataMainBodyProps> = ({ bookId }) => {
  const { data: userData } = useFindUserQuery();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  return (
    <>
      <div className="flex justify-between">
        <p className="font-semibold text-3xl w-1/2 block truncate">
          {data?.book.title}
        </p>
        <CurrentRatingStar userBookId={bookId} />
      </div>
      <Separator className="h-[1px] bg-primary"></Separator>
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-lg pb-6">{data?.book.authors[0]?.name}</p>
          {data?.book.isbn && <p>ISBN: {data?.book.isbn}</p>}
          {data?.book.releaseYear && (
            <p>Rok wydania: {data?.book.releaseYear}</p>
          )}
          <p>
            Język:{' '}
            {data?.book.language
              ? ReversedLanguages[data?.book.language]?.toLowerCase()
              : ''}
          </p>
          {data?.book.translator && <p>Tłumacz: {data?.book.translator}</p>}
          <p>
            Format: {data?.book.format ? BookFormat[data?.book.format] : ''}
          </p>
          {data?.book.pages && <p>Liczba stron: {data?.book.pages}</p>}
          {data?.genres[0]?.name && <p>Kategoria: {data?.genres[0]?.name}</p>}
        </div>
        <div className="flex gap-12 flex-col items-end justify-start">
          <BookshelfChoiceDropdown
            currentBookshelfId={data?.bookshelfId ?? ''}
            bookId={bookId}
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
            <StarRating bookId={bookId}></StarRating>
          </div>
        </div>
      </div>
    </>
  );
};
