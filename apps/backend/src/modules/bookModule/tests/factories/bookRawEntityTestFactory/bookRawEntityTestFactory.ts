import { Generator } from '@common/tests';

import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';

export class BookRawEntityTestFactory {
  public create(input: Partial<BookRawEntity> = {}): BookRawEntity {
    return {
      id: Generator.uuid(),
      title: Generator.word(),
      isbn: Generator.isbn(),
      publisher: Generator.word(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat(),
      pages: Generator.number(100, 1000),
      frontCoverImageUrl: Generator.imageUrl(),
      backCoverImageUrl: Generator.imageUrl(),
      status: Generator.bookReadingStatus(),
      bookshelfId: Generator.uuid(),
      releaseYear: Generator.number(1970, 2024),
      ...input,
    };
  }
}
