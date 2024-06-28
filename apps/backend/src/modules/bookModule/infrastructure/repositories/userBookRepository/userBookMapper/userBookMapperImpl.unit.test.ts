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

  it('maps from UserBookRawEntity to UserBook', () => {
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
        isApproved: book.isApproved,
        bookImageUrl: book.imageUrl as string,
        imageUrl: userBook.imageUrl as string,
        status: userBook.status,
        isFavorite: userBook.isFavorite,
        bookshelfId: userBook.bookshelfId,
        createdAt: userBook.createdAt,
        authorId: null,
        authorName: null,
        isAuthorApproved: null,
        genreId: null,
        genreName: null,
        collectionId: null,
        collectionName: null,
        collectionCreatedAt: null,
        userId: null,
        readingComment: null,
        readingEndedAt: null,
        readingId: null,
        readingRating: null,
        readingStartedAt: null,
      },
    ]);

    expect(userBooks).toEqual([
      {
        id: userBook.id,
        state: {
          imageUrl: userBook.imageUrl,
          status: userBook.status,
          isFavorite: userBook.isFavorite,
          bookshelfId: userBook.bookshelfId,
          createdAt: userBook.createdAt,
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
            isApproved: book.isApproved,
            imageUrl: book.imageUrl,
            authors: [],
          },
          genres: [],
          readings: [],
          collections: [],
        },
      },
    ]);
  });
});
