import { beforeEach, expect, describe, it } from 'vitest';

import { UserBookMapperImpl } from './userBookMapperImpl.js';
import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { UserBookTestFactory } from '../../../../tests/factories/userBookTestFactory/userBookTestFactory.js';

describe('UserBookMapperImpl', () => {
  let userBookMapperImpl: UserBookMapperImpl;

  const bookTestFactory = new BookTestFactory();

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(async () => {
    userBookMapperImpl = new UserBookMapperImpl();
  });

  it('maps from UserBookRawEntity with Book to UserBook', () => {
    const book = bookTestFactory.createRaw();

    const userBook = userBookTestFactory.createRaw({ bookId: book.id });

    const userBooks = userBookMapperImpl.mapRawWithJoinsToDomain([
      {
        id: userBook.id,
        bookId: book.id,
        title: book.title,
        isbn: book.isbn as string,
        publisher: book.publisher as string,
        releaseYear: book.releaseYear as number,
        language: book.language,
        translator: book.translator as string,
        format: book.format,
        pages: book.pages as number,
        imageUrl: userBook.imageUrl as string,
        status: userBook.status,
        bookshelfId: userBook.bookshelfId,
        authorId: null,
        firstName: null,
        lastName: null,
        genreId: null,
        genreName: null,
      },
    ]);

    expect(userBooks).toEqual([
      {
        id: userBook.id,
        state: {
          imageUrl: userBook.imageUrl,
          status: userBook.status,
          bookshelfId: userBook.bookshelfId,
          bookId: userBook.bookId,
          book: {
            id: book.id,
            title: book.title,
            isbn: book.isbn,
            publisher: book.publisher,
            releaseYear: book.releaseYear,
            language: book.language,
            translator: book.translator,
            format: book.format,
            pages: book.pages,
            authors: [],
            genres: [],
          },
        },
      },
    ]);
  });
});
