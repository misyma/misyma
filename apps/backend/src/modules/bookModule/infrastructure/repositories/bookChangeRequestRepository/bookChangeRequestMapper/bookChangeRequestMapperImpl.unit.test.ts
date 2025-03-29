import { beforeEach, expect, describe, it } from 'vitest';

import { BookChangeRequestTestFactory } from '../../../../tests/factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';
import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';

import { BookChangeRequestMapperImpl } from './bookChangeRequestMapperImpl.js';

describe('BookChangeRequestMapperImpl', () => {
  let mapper: BookChangeRequestMapperImpl;

  const bookTestFactory = new BookTestFactory();

  const bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  beforeEach(async () => {
    mapper = new BookChangeRequestMapperImpl();
  });

  it('maps from book change request raw entity to domain book change request', async () => {
    const bookRawEntity = bookTestFactory.createRaw();

    const bookChangeRequestRawEntity = bookChangeRequestTestFactory.createRaw();

    const bookChangeRequests = mapper.mapRawWithJoinsToDomain([
      {
        id: bookChangeRequestRawEntity.id,
        title: bookChangeRequestRawEntity.title,
        isbn: bookChangeRequestRawEntity.isbn,
        publisher: bookChangeRequestRawEntity.publisher,
        releaseYear: bookChangeRequestRawEntity.releaseYear,
        language: bookChangeRequestRawEntity.language,
        translator: bookChangeRequestRawEntity.translator,
        format: bookChangeRequestRawEntity.format,
        pages: bookChangeRequestRawEntity.pages,
        imageUrl: bookChangeRequestRawEntity.imageUrl,
        bookId: bookChangeRequestRawEntity.bookId,
        userEmail: bookChangeRequestRawEntity.userEmail,
        createdAt: bookChangeRequestRawEntity.createdAt,
        authorIds: bookChangeRequestRawEntity.authorIds,
        bookTitle: bookRawEntity.title,
        changedFields: bookChangeRequestRawEntity.changedFields,
      },
    ]);

    expect(bookChangeRequests[0]).toEqual({
      id: bookChangeRequestRawEntity.id,
      state: {
        title: bookChangeRequestRawEntity.title,
        isbn: bookChangeRequestRawEntity.isbn,
        publisher: bookChangeRequestRawEntity.publisher,
        releaseYear: bookChangeRequestRawEntity.releaseYear,
        language: bookChangeRequestRawEntity.language,
        translator: bookChangeRequestRawEntity.translator,
        format: bookChangeRequestRawEntity.format,
        pages: bookChangeRequestRawEntity.pages,
        imageUrl: bookChangeRequestRawEntity.imageUrl,
        bookId: bookChangeRequestRawEntity.bookId,
        userEmail: bookChangeRequestRawEntity.userEmail,
        createdAt: bookChangeRequestRawEntity.createdAt,
        authorIds: bookChangeRequestRawEntity.authorIds,
        bookTitle: bookRawEntity.title,
        changedFields: bookChangeRequestRawEntity.changedFields.split(','),
      },
    });
  });
});
