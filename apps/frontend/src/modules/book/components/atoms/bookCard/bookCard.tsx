import { type FC, useMemo } from 'react';
import { HiClock, HiDotsCircleHorizontal } from 'react-icons/hi';
import { HiCheckCircle, HiEnvelope, HiQuestionMarkCircle } from 'react-icons/hi2';

import { ReadingStatus, sortOrders, type UserBook } from '@common/contracts';

import { FindBookBorrowingsQueryOptions } from '../../../../borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { TruncatedTextTooltip } from '../../../../common/components/truncatedTextTooltip/truncatedTextTooltip';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../../common/lib/utils';
import { useNavigateToBook } from '../../../api/hooks/useNavigateToBook';
import { BookImageMiniature } from '../../molecules/bookImageMiniature/bookImageMiniature';
import { BookmarkButton } from '../bookmarkButton/bookmarkButton';

const BorrowedSinceText: FC<{ userBookId: string }> = ({ userBookId }) => {
  const { data: bookBorrowing } = useErrorHandledQuery(
    FindBookBorrowingsQueryOptions({
      userBookId,
      page: 1,
      pageSize: 1,
      sortDate: sortOrders.desc,
      isOpen: true,
    }),
  );

  const totalDaysSinceBorrowing = useMemo(() => {
    const millisecondsInDay = 86400000;

    return Math.ceil((Date.now() - new Date(bookBorrowing?.data?.[0]?.startedAt ?? '').getTime()) / millisecondsInDay);
  }, [bookBorrowing?.data]);

  return (
    <div className="grid grid-cols-1">
      <div className="flex gap-2 items-center">
        <HiEnvelope className="w-4 h-4 text-primary" />
        <p className="text-sm">{bookBorrowing?.data?.[0]?.borrower}</p>
      </div>
      <span className="flex gap-2 text-sm">
        dni: {totalDaysSinceBorrowing} <HiClock className="h-5 w-5" />{' '}
      </span>
    </div>
  );
};

export const BookCard: FC<{
  className?: string;
  book: UserBook;
  key: string;
  isBorrowed: boolean;
  pageNumber: number;
}> = ({ className, book, isBorrowed = false }) => {
  const authors = useMemo(() => book.book.authors.map((a) => a.name).join(', '), [book]);

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
    [],
  );

  const statusInfo = readingStatusMap[book.status];

  return (
    <div
      className={cn('relative h-full cursor-pointer', className)}
      onClick={navigateToBook}
    >
      <div className="absolute right-0 top-0 z-40">
        <BookmarkButton book={book} />
      </div>
      <div className="flex flex-col h-full max-h-[344px] rounded-[20px] border shadow-sm shadow-gray-400 transition-transform duration-300 ease-in-out">
        <div className="pt-4 pb-2 px-4 aspect-[2/1] rounded-[4px] flex-shrink-0">
          <BookImageMiniature
            bookImageSrc={(book?.imageUrl || book?.book?.imageUrl) ?? ''}
            className="w-full overflow border-gray-400 border-opacity-20 rounded-[4px]"
            imageClassName="object-contain rounded-md"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <TruncatedTextTooltip text={book.book.title}>
            <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">{book.book.title}</h3>
          </TruncatedTextTooltip>
          <TruncatedTextTooltip text={authors}>
            <p className="line-clamp-1 text-gray-600 mb-2">{authors}</p>
          </TruncatedTextTooltip>
          <div className="flex items-center mt-auto">
            {!isBorrowed && <statusInfo.Icon className={cn('h-5 w-5 mr-2', statusInfo.color)} />}
            {!isBorrowed && <span className={cn('text-sm font-medium', statusInfo.color)}>{statusInfo.label}</span>}
            {isBorrowed && <BorrowedSinceText userBookId={book.id} />}
          </div>
        </div>
      </div>
    </div>
  );
};
