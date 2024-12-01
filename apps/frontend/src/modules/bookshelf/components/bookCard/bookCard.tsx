import { ReadingStatus, UserBook } from '@common/contracts';
import { FC, useMemo } from 'react';
import { BookImageMiniature } from '../../../book/components/bookImageMiniature/bookImageMiniature';
import { TruncatedTextTooltip } from '../../../book/components/truncatedTextTooltip/truncatedTextTooltip';
import { HiCheckCircle, HiQuestionMarkCircle } from 'react-icons/hi2';
import { HiDotsCircleHorizontal } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils';
import { AltFavoriteBookButton } from '../../../book/components/favoriteBookButton/altFavoriteBookButton';

export const BookCard: FC<{ book: UserBook; key: string }> = ({
  book,
  key,
}) => {
  const authors = useMemo(
    () => book.book.authors.map((a) => a.name).join(', '),
    [book]
  );

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
    <div className="relative h-full" key={key}>
      <div className="absolute right-2 top-2 z-10">
        <AltFavoriteBookButton book={book} />
      </div>
      <div className="flex flex-col h-full rounded-[20px] shadow-sm shadow-gray-400 transition-transform duration-300 ease-in-out">
        <div className="pt-4 pb-2 px-4 aspect-[2/1] rounded-[4px] flex-shrink-0">
          <BookImageMiniature
            bookImageSrc={book.imageUrl}
            className="w-full overflow border border-gray-400 border-opacity-20 rounded-[4px]"
            imageClassName="object-contain rounded-md"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <TruncatedTextTooltip text={book.book.title}>
            <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[2.75rem]">
              {book.book.title}
            </h3>
          </TruncatedTextTooltip>
          <TruncatedTextTooltip text={authors}>
            <p className="line-clamp-1 text-gray-600 mb-2">{authors}</p>
          </TruncatedTextTooltip>
          <div className="flex items-center mt-auto">
            <statusInfo.Icon className={cn('h-5 w-5 mr-2', statusInfo.color)} />
            <span className={cn('text-sm font-medium', statusInfo.color)}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
