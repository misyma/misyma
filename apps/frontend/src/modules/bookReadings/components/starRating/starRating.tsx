import { FC, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '../../../common/components/radioGroup/radio-group';
import { HiStar } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useSelector } from 'react-redux';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { CreateBookReadingModal } from '../../../book/components/createBookReadingModal/createBookReadingModal';
import { BookReading } from '@common/contracts';
import { FindBookReadingsQueryOptions } from '../../api/queries/findBookReadings/findBookReadingsQueryOptions';

interface Props {
  bookId: string;
}

export const StarRating: FC<Props> = ({ bookId }: Props) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [hoveredValue, setHoveredValue] = useState<number | undefined>();

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
      <div className="flex gap-2 items-center justify-center">
        <div className="animate-wiggle text-primary font-bold text-xl">{hoveredValue}</div>
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
                            onMouseEnter={() => setHoveredValue(index + 1)}
                            onMouseLeave={() => setHoveredValue(undefined)}
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
      </div>
    </>
  );
};
