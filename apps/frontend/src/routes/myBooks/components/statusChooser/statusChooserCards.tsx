import { FC, useState } from 'react';
import {
  FindUserBookQueryOptions,
} from '../../../../api/books/queries/findUserBook/findUserBookQueryOptions';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery';
import { HiCheckCircle, HiDotsCircleHorizontal } from 'react-icons/hi';
import { HiQuestionMarkCircle } from 'react-icons/hi';
import { ReadingStatus } from '@common/contracts';
import { cn } from '../../../../lib/utils';
import { useUpdateUserBookMutation } from '../../../../api/books/mutations/updateUserBookMutation/updateUserBookMutation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';

interface Props {
  bookId: string;
}

export const StatusChooserCards: FC<Props> = ({ bookId }) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data, isFetching, isFetched, isRefetching } = useQuery(
    FindUserBookQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const [readingStatus, setReadingStatus] = useState(data?.status);

  const baseBoxClass =
    'sm:w-40 bg-slate-100 flex flex-col items-center gap-2 p-4 border-2 border-gray-200 cursor-pointer';

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onChangeStatus = async (chosenStatus: ReadingStatus) => {
    if (chosenStatus === readingStatus) {
      return;
    }

    await updateUserBook({
      userBookId: data?.id as string,
      status: chosenStatus,
      accessToken: accessToken as string,
    });

    queryClient.invalidateQueries({
      queryKey: ['findUserBookById', bookId, userData?.id],
    });

    setReadingStatus(chosenStatus);
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
