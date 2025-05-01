import { beforeEach, expect, describe, it } from 'vitest';

import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';

import { BookMapperImpl } from './bookMapperImpl.js';

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
        categoryId: bookRawEntity.category_id,
        title: bookRawEntity.title,
        isbn: bookRawEntity.isbn,
        publisher: bookRawEntity.publisher,
        releaseYear: bookRawEntity.release_year,
        language: bookRawEntity.language,
        translator: bookRawEntity.translator,
        format: bookRawEntity.format,
        categoryName: '',
        pages: bookRawEntity.pages,
        isApproved: bookRawEntity.is_approved,
        imageUrl: bookRawEntity.image_url,
        authors: [],
      },
    });
  });

  it('maps from bookRawEntity with Author to Book', () => {
    const book = bookTestFactory.createRaw();

    const books = bookMapperImpl.mapRawWithJoinsToDomain([
      {
        id: book.id,
        category_id: book.category_id,
        category_name: 'category',
        title: book.title,
        isbn: book.isbn as string,
        publisher: book.publisher as string,
        release_year: book.release_year,
        language: book.language,
        translator: book.translator as string,
        format: book.format,
        pages: book.pages as number,
        is_approved: book.is_approved,
        image_url: book.image_url as string,
        author_ids: [],
        author_names: [],
        author_approvals: [],
      },
    ]);

    expect(books).toEqual([
      {
        id: book.id,
        state: {
          categoryId: book.category_id,
          title: book.title,
          categoryName: 'category',
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.release_year,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.is_approved,
          imageUrl: book.image_url,
          authors: [],
        },
      },
    ]);
  });
});
