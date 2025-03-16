import { type FC, useEffect, useState } from 'react';
import { HiCheckCircle, HiDotsCircleHorizontal, HiQuestionMarkCircle } from 'react-icons/hi';

import { ReadingStatus } from '@common/contracts';

import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../../common/lib/utils';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useUpdateUserBook } from '../../../hooks/updateUserBook/updateUserBook';

interface Props {
  bookId: string;
  bookshelfId: string;
}

export const StatusChooserCards: FC<Props> = ({ bookId, bookshelfId }) => {
  const { data, isFetching, isFetched, isRefetching } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { updateBookStatus } = useUpdateUserBook(bookId);

  const [readingStatus, setReadingStatus] = useState(data?.status);

  useEffect(() => {
    if (readingStatus !== data?.status) {
      setReadingStatus(data?.status);
    }
    // Nein, if present, causes flicker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status]);

  const baseBoxClass =
    'sm:w-40 bg-slate-100 flex flex-col items-center gap-2 p-4 border-2 border-gray-200 cursor-pointer';

  const onChangeStatus = async (chosenStatus: ReadingStatus) => {
    setReadingStatus(chosenStatus);

    await updateBookStatus({
      current: readingStatus,
      updated: chosenStatus,
      bookshelfId,
    });
  };

  return (
    <>
      {isFetching && !isRefetching && (
        <div className="flex gap-2 justify-end text-gray-400">
          <div className="sm:w-40 flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-12 w-12"></Skeleton>
            <Skeleton className="w-full h-4"></Skeleton>
          </div>
          <div className="sm:w-40 flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-12 w-12"></Skeleton>
            <Skeleton className="w-full h-4"></Skeleton>
          </div>
          <div className="sm:w-40 flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-12 w-12"></Skeleton>
            <Skeleton className="w-full h-4"></Skeleton>
          </div>
        </div>
      )}
      {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
        <div className="flex gap-2 justify-end text-gray-400">
          <div
            className={cn(
              baseBoxClass,
              readingStatus === ReadingStatus.finished
                ? 'text-green-400 border-green-500 cursor-default pointer-events-none'
                : '',
              'hover:text-green-400 hover:border-green-500',
            )}
            onClick={async () => await onChangeStatus(ReadingStatus.finished)}
          >
            <HiCheckCircle className="h-12 w-12"></HiCheckCircle>
            <p className="font-semibold text-xs">Przeczytana</p>
          </div>
          <div
            className={cn(
              baseBoxClass,
              readingStatus === ReadingStatus.inProgress
                ? 'text-blue-300 border-blue-400 cursor-default pointer-events-none'
                : '',
              'hover:text-blue-300 hover:border-blue-400',
            )}
            onClick={async () => await onChangeStatus(ReadingStatus.inProgress)}
          >
            <HiDotsCircleHorizontal className="h-12 w-12"></HiDotsCircleHorizontal>
            <p className="font-semibold text-xs">W trakcie</p>
          </div>
          <div
            className={cn(
              baseBoxClass,
              readingStatus === ReadingStatus.toRead
                ? 'text-slate-500 border-slate-700 cursor-default pointer-events-none'
                : '',
              'hover:text-slate-500 hover:border-slate-700',
            )}
            onClick={async () => await onChangeStatus(ReadingStatus.toRead)}
          >
            <HiQuestionMarkCircle className="h-12 w-12"></HiQuestionMarkCircle>
            <p className="font-semibold text-xs">Do przeczytania</p>
          </div>
        </div>
      )}
    </>
  );
};
