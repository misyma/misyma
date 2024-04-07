import { beforeEach, expect, describe, it } from 'vitest';

import { BookMapperImpl } from './bookMapperImpl.js';
import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';

describe('BookMapperImpl', () => {
  let bookMapperImpl: BookMapperImpl;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    bookMapperImpl = new BookMapperImpl();
  });

  it('maps from book raw entity to domain book', async () => {
    const bookRawEntity = bookTestFactory.createRaw();

    const book = bookMapperImpl.mapRawToDomain(bookRawEntity);

    expect(book).toEqual({
      id: bookRawEntity.id,
      state: {
        title: bookRawEntity.title,
        isbn: bookRawEntity.isbn,
        publisher: bookRawEntity.publisher,
        releaseYear: bookRawEntity.releaseYear,
        language: bookRawEntity.language,
        translator: bookRawEntity.translator,
        format: bookRawEntity.format,
        pages: bookRawEntity.pages,
        authors: [],
      },
    });
  });

  it('maps from bookRawEntity with Author to Book', () => {
    const book = bookTestFactory.createRaw();

    const books = bookMapperImpl.mapRawWithJoinsToDomain([
      {
        id: book.id,
        title: book.title,
        isbn: book.isbn as string,
        publisher: book.publisher as string,
        releaseYear: book.releaseYear as number,
        language: book.language,
        translator: book.translator as string,
        format: book.format,
        pages: book.pages as number,
        authorId: null,
        firstName: null,
        lastName: null,
      },
    ]);

    expect(books).toEqual([
      {
        id: book.id,
        state: {
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          authors: [],
        },
      },
    ]);
  });
});
