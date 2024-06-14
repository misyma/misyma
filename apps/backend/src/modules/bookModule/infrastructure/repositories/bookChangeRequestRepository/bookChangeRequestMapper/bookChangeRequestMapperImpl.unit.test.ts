import { beforeEach, expect, describe, it } from 'vitest';

import { BookChangeRequestMapperImpl } from './bookChangeRequestMapperImpl.js';
import { BookChangeRequestTestFactory } from '../../../../tests/factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';

describe('BookChangeRequestMapperImpl', () => {
  let mapper: BookChangeRequestMapperImpl;

  const bookTestFactory = new BookChangeRequestTestFactory();

  beforeEach(async () => {
    mapper = new BookChangeRequestMapperImpl();
  });

  it('maps from book raw entity to domain book', async () => {
    const rawEntity = bookTestFactory.createRaw();

    const entity = mapper.mapToDomain(rawEntity);

    expect(entity).toEqual({
      id: rawEntity.id,
      state: {
        title: rawEntity.title,
        isbn: rawEntity.isbn,
        publisher: rawEntity.publisher,
        releaseYear: rawEntity.releaseYear,
        language: rawEntity.language,
        translator: rawEntity.translator,
        format: rawEntity.format,
        pages: rawEntity.pages,
        imageUrl: rawEntity.imageUrl,
        bookId: rawEntity.bookId,
        userId: rawEntity.userId,
        createdAt: rawEntity.createdAt,
      },
    });
  });
});
