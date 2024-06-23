import { type BookReadingMapper } from './bookReadingMapper.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingRawEntity } from '../../../databases/bookDatabase/tables/bookReadingTable/bookReadingRawEntity.js';

export class BookReadingMapperImpl implements BookReadingMapper {
  public mapToDomain({ id, userBookId, comment, rating, startedAt, endedAt }: BookReadingRawEntity): BookReading {
    return new BookReading({
      id,
      userBookId,
      comment,
      rating,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
    });
  }
}
