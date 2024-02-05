import { type BookReadingMapper } from './bookReadingMapper.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingRawEntity } from '../../../databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingRawEntity.js';

export class BookReadingMapperImpl implements BookReadingMapper {
  public mapToDomain({ id, bookId, comment, rating, startedAt, endedAt }: BookReadingRawEntity): BookReading {
    return new BookReading({
      id,
      bookId,
      comment,
      rating,
      startedAt,
      endedAt,
    });
  }
}
