import { type BookReadingRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingRawEntity.js';
import { BookReading } from '../../../../domain/entities/bookReading/bookReading.js';

import { type BookReadingMapper } from './bookReadingMapper.js';

export class BookReadingMapperImpl implements BookReadingMapper {
  public mapToDomain({ id, userBookId, comment, rating, startedAt, endedAt }: BookReadingRawEntity): BookReading {
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
