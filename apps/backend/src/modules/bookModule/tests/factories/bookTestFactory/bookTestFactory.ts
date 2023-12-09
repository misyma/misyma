import { Generator } from '@common/tests';

import { type Book } from '../../../domain/entities/book/book.js';

export class BookTestFactory {
  public create(input: Partial<Book> = {}): Book {
    return {
      id: Generator.uuid(),
      title: Generator.word(),
      releaseYear: Generator.number(1970, 2024),
      authorId: Generator.uuid(),
      ...input,
    };
  }
}
