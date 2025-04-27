import { Generator } from '../../../../../../tests/generator.js';
import { BookReading, type BookReadingState } from '../../../../bookModule/domain/entities/bookReading/bookReading.js';
import { type BookReadingRawEntity } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingRawEntity.js';

export class BookReadingTestFactory {
  public create(input: Partial<BookReadingState> = {}): BookReading {
    return new BookReading({
      id: Generator.uuid(),
      userBookId: Generator.uuid(),
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
      userBookId: Generator.uuid(),
      rating: Generator.number(1, 10),
      comment: Generator.words(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.futureDate(),
      ...input,
    };
  }
}
