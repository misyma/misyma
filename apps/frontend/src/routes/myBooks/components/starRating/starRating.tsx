import { FC } from 'react';
import { IoIosStar, IoIosStarOutline } from 'react-icons/io';

interface Props {
  grade: number;
}

export const StarRating: FC<Props> = ({ grade }: Props) => {
  return (
    <div className='flex'>
      {Array.from({ length: 10 }).map((_, index) => {
        if (index < grade) {
          return <IoIosStar key={index} />;
        }
        return <IoIosStarOutline key={index} />;
      })}
    </div>
  );
};
