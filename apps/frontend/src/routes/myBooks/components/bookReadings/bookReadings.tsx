import { FC } from 'react';
import { StarRating } from '../starRating/starRating';
import { BookReading } from '@common/contracts';

interface Props {
  readings: BookReading[];
}

export const BookReadings: FC<Props> = ({ readings }: Props) => {
  return (
    <>
      {readings.map((note, index) => {
        return (
          <div key={`${index}-${note.endedAt?.toString()}-${note.rating}`} className="py-2">
            <p>{note?.endedAt}</p>
            <StarRating grade={note.rating} />
            <p className="py-2">{note.comment}</p>
          </div>
        );
      })}
    </>
  );
};
