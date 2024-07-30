import { FC, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '../../../common/components/radioGroup/radio-group';
import { HiStar } from 'react-icons/hi';
import { CreateBookReadingModal } from '../createBookReadingModal/createBookReadingModal';

interface Props {
  userBookId: string;
  onCreated: () => Promise<void>;
}

export const AddStarRatingButton: FC<Props> = ({ userBookId, onCreated }: Props) => {
  const [hoveredValue, setHoveredValue] = useState<number | undefined>();

  return (
    <div className="flex gap-2">
      <div className='animate-wiggle text-primary font-bold '>{hoveredValue}</div>
      <RadioGroup className="flex flex-row gap-0">
        <>
          {Array.from({ length: 10 }).map((_, index) => {
            return (
              <>
                <div className="relative star-container">
                  <CreateBookReadingModal
                    bookId={userBookId}
                    rating={index + 1}
                    onMutated={async () => {
                      await onCreated();
                    }}
                    trigger={
                      <RadioGroupItem
                        className="absolute opacity-0 h-6 w-6"
                        key={index}
                        value={`${index}`}
                        onMouseEnter={() => setHoveredValue(index + 1)}
                        onMouseLeave={() => setHoveredValue(undefined)}
                      />
                    }
                  ></CreateBookReadingModal>
                  <HiStar className="h-6 w-6" />
                </div>
              </>
            );
          })}
        </>
      </RadioGroup>
    </div>
  );
};
