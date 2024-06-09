import { FC } from 'react';
import { Skeleton } from '../../../../modules/common/components/ui/skeleton';
import { Separator } from '@radix-ui/react-separator';
import { BookshelfChoiceDropdown } from '../../../../modules/book/components/bookshelfChoiceDropdown/bookshelfChoiceDropdown';
import { StatusChooserCards } from '../../../../modules/book/components/statusChooser/statusChooserCards';
import { StarRating } from '../../../../modules/bookReadings/components/starRating/starRating';

interface Props {
    bookId: string;
}

export const BasicDataTabSkeleton: FC<Props> = ({ bookId }) => {
  return (
    <>
      <div>
        <Skeleton className="w-60 h-80"></Skeleton>
      </div>
      <div>
        <Skeleton className="h-8 w-8"></Skeleton>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-between w-full">
          <Skeleton className="w-80 h-9"></Skeleton>
          <Skeleton className="h-8 w-8" />
        </div>
        <Separator></Separator>
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
            <Skeleton className="w-48 h-6"></Skeleton>
          </div>
          <div className="flex gap-12 flex-col items-end justify-start">
            <BookshelfChoiceDropdown bookId={bookId} />
            <div className="flex flex-col text-lg items-end gap-2">
              <Skeleton className="w-40 h-8"></Skeleton>
              <StatusChooserCards bookId={bookId}></StatusChooserCards>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p>Dodaj ocenę</p>
              <StarRating bookId={bookId ?? ''}></StarRating>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
