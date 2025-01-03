import { ReadingStatus, SortingType, UserBook } from '@common/contracts';
import { FC, useMemo } from 'react';
import { BookImageMiniature } from '../../../book/components/bookImageMiniature/bookImageMiniature';
import { TruncatedTextTooltip } from '../../../book/components/truncatedTextTooltip/truncatedTextTooltip';
import {
  HiCheckCircle,
  HiEnvelope,
  HiQuestionMarkCircle,
} from 'react-icons/hi2';
import { HiClock, HiDotsCircleHorizontal } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils';
import { AltFavoriteBookButton } from '../../../book/components/favoriteBookButton/altFavoriteBookButton';
import { useNavigateToBook } from '../../../book/api/hooks/useNavigateToBook';
import { FindBookBorrowingsQueryOptions } from '../../../borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';

const BorrowedSinceText: FC<{ userBookId: string }> = ({ userBookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookBorrowing } = useErrorHandledQuery(
    FindBookBorrowingsQueryOptions({
      accessToken: accessToken as string,
      userBookId,
      page: 1,
      pageSize: 1,
      sortDate: SortingType.desc,
      isOpen: true,
    })
  );

  const totalDaysSinceBorrowing = useMemo(() => {
    const millisecondsInDay = 86400000;

    return Math.ceil(
      (Date.now() -
        new Date(bookBorrowing?.data[0]?.startedAt ?? '').getTime()) /
        millisecondsInDay
    );
  }, [bookBorrowing?.data]);

  return (
    <div className="grid grid-cols-1">
      <div className="flex gap-2 items-center">
        <HiEnvelope className="w-4 h-4 text-primary" />
        <p className="text-sm">{bookBorrowing?.data[0].borrower}</p>
      </div>
      <span className="flex gap-2 text-sm">
        dni: {totalDaysSinceBorrowing} <HiClock className="h-5 w-5" />{' '}
      </span>
    </div>
  );
};

export const BookCard: FC<{
  book: UserBook;
  key: string;
  isBorrowed: boolean;
  pageNumber: number;
}> = ({ book, pageNumber, isBorrowed = false }) => {
  const authors = useMemo(
    () => book.book.authors.map((a) => a.name).join(', '),
    [book]
  );

  const { navigateToBook } = useNavigateToBook({
    bookId: book.id,
  });

  const readingStatusMap = useMemo(
    () => ({
      [ReadingStatus.finished]: {
        Icon: HiCheckCircle,
        label: 'Przeczytana',
        color: 'text-green-400',
      },
      [ReadingStatus.inProgress]: {
        Icon: HiDotsCircleHorizontal,
        label: 'Czytana',
        color: 'text-blue-300',
      },
      [ReadingStatus.toRead]: {
        Icon: HiQuestionMarkCircle,
        label: 'Do przeczytania',
        color: 'text-slate-500',
      },
    }),
    []
  );

  const statusInfo = readingStatusMap[book.status];

  return (
    <div className="relative h-full cursor-pointer" onClick={navigateToBook}>
      <div className="absolute right-2 top-2 z-40">
        <AltFavoriteBookButton pageNumber={pageNumber} book={book} />
      </div>
      <div className="flex flex-col h-full max-h-[344px] rounded-[20px] border shadow-sm shadow-gray-400 transition-transform duration-300 ease-in-out">
        <div className="pt-4 pb-2 px-4 aspect-[2/1] rounded-[4px] flex-shrink-0">
          <BookImageMiniature
            bookImageSrc={book.imageUrl}
            className="w-full overflow border-gray-400 border-opacity-20 rounded-[4px]"
            imageClassName="object-contain rounded-md"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <TruncatedTextTooltip text={book.book.title}>
            <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
              {book.book.title}
            </h3>
          </TruncatedTextTooltip>
          <TruncatedTextTooltip text={authors}>
            <p className="line-clamp-1 text-gray-600 mb-2">{authors}</p>
          </TruncatedTextTooltip>
          <div className="flex items-center mt-auto">
            {!isBorrowed && (
              <statusInfo.Icon
                className={cn('h-5 w-5 mr-2', statusInfo.color)}
              />
            )}
            {!isBorrowed && (
              <span className={cn('text-sm font-medium', statusInfo.color)}>
                {statusInfo.label}
              </span>
            )}
            {isBorrowed && <BorrowedSinceText userBookId={book.id} />}
          </div>
        </div>
      </div>
    </div>
  );
};
