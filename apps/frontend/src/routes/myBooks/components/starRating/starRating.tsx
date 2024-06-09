import { FC } from 'react';
import { RadioGroup, RadioGroupItem } from '../../../../modules/common/components/ui/radio-group';
import { HiStar } from 'react-icons/hi';
import { cn } from '../../../../modules/common/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { useSelector } from 'react-redux';
import { Skeleton } from '../../../../modules/common/components/ui/skeleton';
import { CreateBookReadingModal } from '../createBookReadingModal/createBookReadingModal';
import { BookReading } from '@common/contracts';
import { FindBookReadingsQueryOptions } from '../../../../modules/bookReadings/api/queries/findBookReadings/findBookReadingsQueryOptions';

interface Props {
  bookId: string;
}

export const StarRating: FC<Props> = ({ bookId }: Props) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const {
    data: bookReadings,
    refetch,
    isFetched,
    isFetching,
    isRefetching,
  } = useQuery(
    FindBookReadingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: bookId,
    }),
  );

  return (
    <>
      {isFetching && !isRefetching && (
        <>
          <RadioGroup
            className="flex flex-row gap-0"
            disabled={true}
            value={`${bookReadings?.data[0]?.rating ?? 0}`}
          >
            <>
              {Array.from({ length: 10 }).map((_, index) => {
                return (
                  <>
                    <div
                      className={cn(
                        'relative star-container',
                        bookReadings?.data[0]?.rating ?? 0 >= index + 1 ? 'text-primary' : '',
                      )}
                    >
                      <Skeleton className={cn('h-7 w-7')} />
                    </div>
                  </>
                );
              })}
            </>
          </RadioGroup>
        </>
      )}
      {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
        <RadioGroup
          className="flex flex-row gap-0"
          value={`${bookReadings?.data[0]?.rating ?? 0}`}
        >
          <>
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <>
                  <div
                    className={cn(
                      'relative star-container',
                      (bookReadings?.data[0] as BookReading)?.rating >= index + 1 ? 'text-primary' : '',
                    )}
                  >
                    <CreateBookReadingModal
                      bookId={bookId}
                      rating={index + 1}
                      onMutated={async () => {
                        refetch();
                      }}
                      trigger={
                        <RadioGroupItem
                          className="absolute opacity-0 h-7 w-7"
                          key={index}
                          value={`${index}`}
                        />
                      }
                    ></CreateBookReadingModal>
                    <HiStar className={cn('h-7 w-7')} />
                  </div>
                </>
              );
            })}
          </>
        </RadioGroup>
      )}
    </>
  );
};
