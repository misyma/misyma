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
      releaseYear: bookEntity.releaseYear,
      authors: [],
      domainActions: [],
    });
  });

  it('maps from bookRawEntity with Author to Book', () => {
    const book = bookEntityTestFactory.create();

    const xd = bookMapperImpl.mapRawWithAuthorToDomain([
      {
        ...book,
        authorId: null,
        firstName: null,
        lastName: null,
      },
    ]);

    expect(xd).toEqual([
      {
        id: book.id,
        title: book.title,
        releaseYear: book.releaseYear,
        authors: [],
        domainActions: [],
      },
    ]);
  });
});
