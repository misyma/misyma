import { beforeEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../../tests/generator.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { GenreTestFactory } from '../../../../tests/factories/genreTestFactory/genreTestFactory.js';
import { UserBookTestFactory } from '../../../../tests/factories/userBookTestFactory/userBookTestFactory.js';

import { UserBookMapperImpl } from './userBookMapperImpl.js';

describe('UserBookMapperImpl', () => {
  let userBookMapperImpl: UserBookMapperImpl;

  const genreTestFactory = new GenreTestFactory();

  const bookTestFactory = new BookTestFactory();

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(async () => {
    userBookMapperImpl = new UserBookMapperImpl();
  });

  it('maps from UserBookRawEntity to UserBook', () => {
    const genre = genreTestFactory.createRaw();

    const book = bookTestFactory.createRaw();

    const userBook = userBookTestFactory.createRaw({
      bookId: book.id,
      genreId: genre.id,
    });

    const latestRating = Generator.number(1, 10);

    const userBookDomain = userBookMapperImpl.mapRawWithJoinsToDomain({
      id: userBook.id,
      bookId: book.id,
      title: book.title,
      isbn: book.isbn as string,
      publisher: book.publisher as string,
      releaseYear: book.releaseYear,
      language: book.language,
      translator: book.translator as string,
      format: book.format,
      pages: book.pages as number,
      isApproved: book.isApproved,
      bookImageUrl: book.imageUrl as string,
      bookCreatedAt: book.createdAt,
      imageUrl: userBook.imageUrl as string,
      status: userBook.status,
      isFavorite: userBook.isFavorite,
      bookshelfId: userBook.bookshelfId,
      createdAt: userBook.createdAt,
      genreId: genre.id,
      genreName: genre.name,
      authorIds: [],
      authorNames: [],
      authorApprovals: [],
      authorCreatedAtDates: [],
      collectionIds: [],
      collectionNames: [],
      collectionUserIds: [],
      collectionCreatedAtDates: [],
      readingIds: [],
      readingStartedAtDates: [],
      readingEndedAtDates: [],
      readingRatings: [],
      readingComments: [],
      latestRating,
    });

    expect(userBookDomain).toEqual({
      id: userBook.id,
      state: {
        imageUrl: userBook.imageUrl,
        status: userBook.status,
        isFavorite: userBook.isFavorite,
        bookshelfId: userBook.bookshelfId,
        createdAt: userBook.createdAt,
        bookId: userBook.bookId,
        genreId: genre.id,
        genre: new Genre({
          id: genre.id,
          name: genre.name,
        }),
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
          createdAt: book.createdAt,
          authors: [],
        },
        readings: [],
        collections: [],
        latestRating,
      },
    });
  });
});
