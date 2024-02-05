import { Generator } from '@common/tests';

import { BookReading, type BookReadingState } from '../../../domain/entities/bookReading/bookReading.js';
import {
  BookReadingDraft,
  type BookReadingDraftState,
} from '../../../domain/entities/bookReading/bookReadingDraft/bookReadingDraft.js';
import { type BookReadingRawEntity } from '../../../infrastructure/databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingRawEntity.js';

export class BookReadingTestFactory {
  private constructor() {}

  public static createFactory(): BookReadingTestFactory {
    return new BookReadingTestFactory();
  }

  public create(input: Partial<BookReadingState> = {}): BookReading {
    return new BookReading({
      id: Generator.uuid(),
      bookId: Generator.uuid(),
      rating: Generator.number(1, 10),
      comment: Generator.words(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.pastDate(),
      ...input,
    });
  }

  public createDraft(input: Partial<BookReadingDraftState> = {}): BookReadingDraft {
    return new BookReadingDraft({
      bookId: Generator.uuid(),
      rating: Generator.number(1, 10),
      comment: Generator.words(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.pastDate(),
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
      endedAt: Generator.pastDate(),
      ...input,
    };
  }
}
