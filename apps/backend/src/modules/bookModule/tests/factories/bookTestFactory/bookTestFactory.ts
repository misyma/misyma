import { Generator } from '@common/tests';

import { Book, type BookDraft } from '../../../domain/entities/book/book.js';

export class BookTestFactory {
  public create(input: Partial<BookDraft> = {}): Book {
    return new Book({
      id: Generator.uuid(),
      title: Generator.word(),
      releaseYear: Generator.number(1970, 2024),
      authors: [],
      ...input,
    });
  }
}
