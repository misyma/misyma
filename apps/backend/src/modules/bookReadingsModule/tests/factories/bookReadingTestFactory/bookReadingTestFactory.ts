import { Generator } from '@common/tests';

import { BookReading, type BookReadingState } from '../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingRawEntity } from '../../../infrastructure/databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingRawEntity.js';

export class BookReadingTestFactory {
  public create(input: Partial<BookReadingState> = {}): BookReading {
    return new BookReading({
      id: Generator.uuid(),
      bookId: Generator.uuid(),
      rating: Generator.number(1, 10),
      comment: Generator.words(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.futureDate(),
      ...input,
    });
  }

  public createRaw(input: Partial<BookReadingRawEntity> = {}): BookReadingRawEntity {
    return {
      id: Generator.uuid(),
      bookId: Generator.uuid(),
      rating: Generator.number(1, 10),
      comment: Generator.words(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.futureDate(),
      ...input,
    };
  }
}
