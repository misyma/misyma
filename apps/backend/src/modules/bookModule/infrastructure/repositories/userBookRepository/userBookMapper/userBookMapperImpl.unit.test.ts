import { beforeEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../../tests/generator.js';
import { Category } from '../../../../domain/entities/category/category.js';
import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { UserBookTestFactory } from '../../../../tests/factories/userBookTestFactory/userBookTestFactory.js';

import { UserBookMapperImpl } from './userBookMapperImpl.js';

describe('UserBookMapperImpl', () => {
  let userBookMapperImpl: UserBookMapperImpl;

  const bookTestFactory = new BookTestFactory();

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(async () => {
    userBookMapperImpl = new UserBookMapperImpl();
  });

  it('maps from UserBookRawEntity to UserBook', () => {
    const book = bookTestFactory.createRaw();

    const userBook = userBookTestFactory.createRaw({ book_id: book.id });

    const latestRating = Generator.number(1, 10);

    const userBookDomain = userBookMapperImpl.mapRawWithJoinsToDomain({
      id: userBook.id,
      book_id: book.id,
      title: book.title,
      isbn: book.isbn as string,
      publisher: book.publisher as string,
      release_year: book.release_year,
      language: book.language,
      translator: book.translator as string,
      format: book.format,
      pages: book.pages as number,
      is_approved: book.is_approved,
      book_image_url: book.image_url as string,
      image_url: userBook.image_url as string,
      status: userBook.status,
      is_favorite: userBook.is_favorite,
      bookshelf_id: userBook.bookshelf_id,
      created_at: userBook.created_at,
      author_ids: [],
      author_names: [],
      category_id: '',
      category_name: '',
      author_approvals: [],
      latest_rating: latestRating,
    });

    expect(userBookDomain).toEqual({
      _id: userBook.id,
      state: {
        imageUrl: userBook.image_url,
        status: userBook.status,
        isFavorite: userBook.is_favorite,
        bookshelfId: userBook.bookshelf_id,
        createdAt: userBook.created_at,
        bookId: userBook.book_id,
        book: {
          id: book.id,
          title: book.title,
          categoryId: '',
          category: new Category({
            id: '',
            name: '',
          }),
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
        latestRating,
      },
    });
  });
});
