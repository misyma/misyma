import { type BookFormat, type BookStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { Book, type BookDraft } from '../../../domain/entities/book/book.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';

export class BookTestFactory {
  public create(input: Partial<BookDraft> = {}): Book {
    return new Book({
      id: Generator.uuid(),
      title: Generator.word(),
      isbn: Generator.isbn(),
      publisher: Generator.word(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat() as BookFormat,
      pages: Generator.number(100, 1000),
      imageUrl: Generator.imageUrl(),
      status: Generator.bookReadingStatus() as BookStatus,
      bookshelfId: Generator.uuid(),
      releaseYear: Generator.number(1970, 2024),
      authors: [],
      genres: [],
      ...input,
    });
  }

  public createRaw(input: Partial<BookRawEntity> = {}): BookRawEntity {
    return {
      id: Generator.uuid(),
      title: Generator.word(),
      isbn: Generator.isbn(),
      publisher: Generator.word(),
      language: Generator.language(),
      translator: Generator.fullName(),
      format: Generator.bookFormat() as BookFormat,
      pages: Generator.number(100, 1000),
      imageUrl: Generator.imageUrl(),
      status: Generator.bookReadingStatus() as BookStatus,
      bookshelfId: Generator.uuid(),
      releaseYear: Generator.number(1970, 2024),
      ...input,
    };
  }
}
