import { type FC, useState } from 'react';
import { HiStar } from 'react-icons/hi';

import { RadioGroup, RadioGroupItem } from '../../../common/components/radioGroup/radio-group';
import { cn } from '../../../common/lib/utils';
import { CreateBookReadingModal } from '../createBookReadingModal/createBookReadingModal';

interface Props {
  bookId: string;
}

export const StarRating: FC<Props> = ({ bookId }: Props) => {
  const [hoveredValue, setHoveredValue] = useState<number | undefined>();

  return (
    <>
      <div className="flex gap-2 items-center justify-center">
        <div className="animate-wiggle text-primary font-bold text-xl">{hoveredValue}</div>
        <RadioGroup
          className="flex flex-row gap-0"
          value={`0`}
        >
          <>
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <div
                  key={`star-rating-${index}`}
                  className={cn('relative star-container')}
                >
                  <CreateBookReadingModal
                    bookId={bookId}
                    rating={index + 1}
                    onMutated={() => {}}
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
                  <HiStar
                    key={`star-${index}`}
                    className={cn('h-7 w-7')}
                  />
                </div>
              );
            })}
          </>
        </RadioGroup>
      </div>
    </>
  );
};
