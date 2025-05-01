import { beforeEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../../tests/generator.js';
import { BookshelfTestFactory } from '../../../../tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';

import { BookshelfMapperImpl } from './bookshelfMapperImpl.js';

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
        userId: bookshelfRawEntity.user_id,
        type: bookshelfRawEntity.type,
        createdAt: bookshelfRawEntity.created_at,
        imageUrl: bookshelfRawEntity.image_url,
      },
    });
  });

  it('maps from bookshelf with joins raw entity to domain bookshelf', async () => {
    const bookshelfRawEntity = bookshelfTestFactory.createRaw();

    const bookCount = Generator.number(1, 10);

    const bookshelf = bookshelfMapperImpl.mapRawWithJoinsToDomain([
      {
        ...bookshelfRawEntity,
        book_count: bookCount.toString(),
      },
    ])[0];

    expect(bookshelf).toEqual({
      id: bookshelfRawEntity.id,
      state: {
        name: bookshelfRawEntity.name,
        userId: bookshelfRawEntity.user_id,
        type: bookshelfRawEntity.type,
        createdAt: bookshelfRawEntity.created_at,
        imageUrl: bookshelfRawEntity.image_url,
        bookCount,
      },
    });
  });
});
