import { FC } from 'react';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { HiStar } from 'react-icons/hi';
import { cn } from '../../../../lib/utils';

interface Props {
  grade: number;
}

export const StarRating: FC<Props> = ({ grade }: Props) => {
  return (
    <RadioGroup
      className="flex flex-row gap-0"
      value={`${grade}`}
    >
      <>
        {Array.from({ length: 10 }).map((_, index) => {
          return (
            <>
              <div className="relative">
                <RadioGroupItem
                  className="absolute opacity-0 h-7 w-7"
                  key={index}
                  value={`${index}`}
                />
                <HiStar className={cn('h-7 w-7', index + 1 === grade ? 'text-primary' : '')} />
              </div>
            </>
          );
        })}
      </>
    </RadioGroup>
  );
};
