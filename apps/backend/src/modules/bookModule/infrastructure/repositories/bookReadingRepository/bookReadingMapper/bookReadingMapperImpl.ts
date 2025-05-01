import { type BookReadingRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingRawEntity.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';

import { type BookReadingMapper } from './bookReadingMapper.js';

export class BookReadingMapperImpl implements BookReadingMapper {
  public mapToDomain({
    id,
    user_book_id: userBookId,
    comment,
    rating,
    started_at: startedAt,
    ended_at: endedAt,
  }: BookReadingRawEntity): BookReading {
    return new BookReading({
      id,
      userBookId,
      comment,
      rating,
      startedAt,
      endedAt,
    });
  }
}
