import { FC } from 'react';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { HiStar } from 'react-icons/hi';
import { CreateBookReadingModal } from '../createBookReadingModal/createBookReadingModal';

interface Props {
  userBookId: string;
  onCreated: () => Promise<void>;
}

export const AddStarRatingButton: FC<Props> = ({ userBookId, onCreated }: Props) => {
  return (
    <RadioGroup className="flex h-12 flex-row gap-0">
      <>
        {Array.from({ length: 10 }).map((_, index) => {
          return (
            <>
              <div className='relative star-container'>
                <CreateBookReadingModal
                  bookId={userBookId}
                  rating={index + 1}
                  onMutated={async () => {
                    await onCreated();
                  }}
                  trigger={
                    <RadioGroupItem
                      className="absolute opacity-0 h-12 w-7"
                      key={index}
                      value={`${index}`}
                    />
                  }
                ></CreateBookReadingModal>
                <HiStar className="h-7 w-7" />
              </div>
            </>
          );
        })}
      </>
    </RadioGroup>
  );
};
