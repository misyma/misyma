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

    const book = bookMapperImpl.mapToDomain(bookEntity);

    expect(book).toEqual({
      id: bookEntity.id,
      title: bookEntity.title,
      releaseYear: bookEntity.releaseYear,
    });
  });
});
