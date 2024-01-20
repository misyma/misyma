import { beforeEach, expect, describe, it } from 'vitest';

import { BookMapperImpl } from './bookMapperImpl.js';
import { BookRawEntityTestFactory } from '../../../../tests/factories/bookRawEntityTestFactory/bookRawEntityTestFactory.js';

describe('BookMapperImpl', () => {
  let bookMapperImpl: BookMapperImpl;

  const bookEntityTestFactory = new BookRawEntityTestFactory();

  beforeEach(async () => {
    bookMapperImpl = new BookMapperImpl();
  });

  it('maps from book raw entity to domain book', async () => {
    const bookEntity = bookEntityTestFactory.create();

    const book = bookMapperImpl.mapRawToDomain(bookEntity);

    expect(book).toEqual({
      id: bookEntity.id,
      title: bookEntity.title,
      isbn: bookEntity.isbn,
      publisher: bookEntity.publisher,
      releaseYear: bookEntity.releaseYear,
      language: bookEntity.language,
      translator: bookEntity.translator,
      format: bookEntity.format,
      pages: bookEntity.pages,
      frontCoverImageUrl: bookEntity.frontCoverImageUrl,
      backCoverImageUrl: bookEntity.backCoverImageUrl,
      status: bookEntity.status,
      bookshelfId: bookEntity.bookshelfId,
      authors: [],
      domainActions: [],
    });
  });

  it('maps from bookRawEntity with Author to Book', () => {
    const book = bookEntityTestFactory.create();

    const books = bookMapperImpl.mapRawWithAuthorToDomain([
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
        frontCoverImageUrl: book.frontCoverImageUrl as string,
        backCoverImageUrl: book.backCoverImageUrl as string,
        status: book.status,
        bookshelfId: book.bookshelfId,
        authorId: null,
        firstName: null,
        lastName: null,
      },
    ]);

    expect(books).toEqual([
      {
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        publisher: book.publisher,
        releaseYear: book.releaseYear,
        language: book.language,
        translator: book.translator,
        format: book.format,
        pages: book.pages,
        frontCoverImageUrl: book.frontCoverImageUrl,
        backCoverImageUrl: book.backCoverImageUrl,
        status: book.status,
        bookshelfId: book.bookshelfId,
        authors: [],
        domainActions: [],
      },
    ]);
  });
});
