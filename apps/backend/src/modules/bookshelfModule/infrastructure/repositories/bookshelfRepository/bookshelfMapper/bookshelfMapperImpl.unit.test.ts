import { beforeEach, expect, describe, it } from 'vitest';

import { BookshelfMapperImpl } from './bookshelfMapperImpl.js';
import { BookshelfTestFactory } from '../../../../tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';

describe('BookshelfMapperImpl', () => {
  let bookshelfMapperImpl: BookshelfMapperImpl;

  const bookshelfTestFactory = new BookshelfTestFactory();

  beforeEach(async () => {
    bookshelfMapperImpl = new BookshelfMapperImpl();
  });

  it('maps from bookshelf raw entity to domain bookshelf', async () => {
    const bookshelfRawEntity = bookshelfTestFactory.createRaw();

    const bookshelf = bookshelfMapperImpl.mapToDomain(bookshelfRawEntity);

    expect(bookshelf).toEqual({
      id: bookshelfRawEntity.id,
      state: {
        name: bookshelfRawEntity.name,
        userId: bookshelfRawEntity.userId,
        type: bookshelfRawEntity.type,
      },
    });
  });
});
