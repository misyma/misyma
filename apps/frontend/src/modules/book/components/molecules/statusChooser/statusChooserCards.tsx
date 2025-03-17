import { CheckCircle, Circle, HelpCircle, LoaderCircle } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';

import { ReadingStatus } from '@common/contracts';

import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../../common/lib/utils';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useUpdateUserBook } from '../../../hooks/updateUserBook/updateUserBook';

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  activeColor: string;
  hoverColor: string;
  onClick: () => Promise<void>;
  isLoading?: boolean;
}

const StatusCard: FC<StatusCardProps> = ({
  icon,
  label,
  isActive,
  activeColor,
  hoverColor,
  onClick,
  isLoading = false,
}) => {
  return (
    <button
      className={cn(
        'relative w-full sm:w-32 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
        'bg-white shadow-sm hover:shadow-md',
        isActive ? `${activeColor} cursor-default` : `border-gray-200 text-gray-400 hover:${hoverColor}`,
        isLoading && 'opacity-80 cursor-wait',
      )}
      onClick={onClick}
      disabled={isActive || isLoading}
      aria-pressed={isActive}
    >
      <div className="text-current h-8 w-8">{isLoading ? <LoaderCircle className="h-8 w-8 animate-spin" /> : icon}</div>
      <p className="font-medium text-xs">{label}</p>
    </button>
  );
};

interface Props {
  bookId: string;
  bookshelfId: string;
}

export const StatusChooserCards: FC<Props> = ({ bookId, bookshelfId }) => {
  const { data, isFetching, isRefetching } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { updateBookStatus } = useUpdateUserBook(bookId);
  const [readingStatus, setReadingStatus] = useState<ReadingStatus | undefined>(data?.status);
  const [updatingStatus, setUpdatingStatus] = useState<ReadingStatus | null>(null);

  useEffect(() => {
    if (readingStatus !== data?.status) {
      setReadingStatus(data?.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status]);

  const onChangeStatus = async (chosenStatus: ReadingStatus) => {
    if (updatingStatus) return;

    setUpdatingStatus(chosenStatus);
    setReadingStatus(chosenStatus);

    try {
      await updateBookStatus({
        current: readingStatus,
        updated: chosenStatus,
        bookshelfId,
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const isLoading = isFetching && !isRefetching;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border-2 border-gray-100 p-4 animate-pulse"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      <StatusCard
        icon={<CheckCircle className="h-8 w-8 stroke-[1.5]" />}
        label="Przeczytana"
        isActive={readingStatus === ReadingStatus.finished}
        activeColor="border-green-500 text-green-500 bg-green-50"
        hoverColor="border-green-300 text-green-400"
        onClick={() => onChangeStatus(ReadingStatus.finished)}
        isLoading={updatingStatus === ReadingStatus.finished}
      />

      <StatusCard
        icon={<Circle className="h-8 w-8 stroke-[1.5]" />}
        label="W trakcie"
        isActive={readingStatus === ReadingStatus.inProgress}
        activeColor="border-blue-500 text-blue-500 bg-blue-50"
        hoverColor="border-blue-300 text-blue-400"
        onClick={() => onChangeStatus(ReadingStatus.inProgress)}
        isLoading={updatingStatus === ReadingStatus.inProgress}
      />

      <StatusCard
        icon={<HelpCircle className="h-8 w-8 stroke-[1.5]" />}
        label="Na później"
        isActive={readingStatus === ReadingStatus.toRead}
        activeColor="border-slate-700 text-slate-700 bg-slate-50"
        hoverColor="border-slate-500 text-slate-500"
        onClick={() => onChangeStatus(ReadingStatus.toRead)}
        isLoading={updatingStatus === ReadingStatus.toRead}
      />
    </div>
  );
};
