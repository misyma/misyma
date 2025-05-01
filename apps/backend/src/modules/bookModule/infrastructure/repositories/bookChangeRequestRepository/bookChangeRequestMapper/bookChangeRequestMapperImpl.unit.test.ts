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
        release_year: bookChangeRequestRawEntity.release_year,
        language: bookChangeRequestRawEntity.language,
        translator: bookChangeRequestRawEntity.translator,
        format: bookChangeRequestRawEntity.format,
        pages: bookChangeRequestRawEntity.pages,
        image_url: bookChangeRequestRawEntity.image_url,
        book_id: bookChangeRequestRawEntity.book_id,
        user_email: bookChangeRequestRawEntity.user_email,
        created_at: bookChangeRequestRawEntity.created_at,
        author_ids: bookChangeRequestRawEntity.author_ids,
        book_title: bookRawEntity.title,
        changed_fields: bookChangeRequestRawEntity.changed_fields,
      },
    ]);

    expect(bookChangeRequests[0]).toEqual({
      id: bookChangeRequestRawEntity.id,
      state: {
        title: bookChangeRequestRawEntity.title,
        isbn: bookChangeRequestRawEntity.isbn,
        publisher: bookChangeRequestRawEntity.publisher,
        releaseYear: bookChangeRequestRawEntity.release_year,
        language: bookChangeRequestRawEntity.language,
        translator: bookChangeRequestRawEntity.translator,
        format: bookChangeRequestRawEntity.format,
        pages: bookChangeRequestRawEntity.pages,
        imageUrl: bookChangeRequestRawEntity.image_url,
        bookId: bookChangeRequestRawEntity.book_id,
        userEmail: bookChangeRequestRawEntity.user_email,
        createdAt: bookChangeRequestRawEntity.created_at,
        authorIds: bookChangeRequestRawEntity.author_ids,
        bookTitle: bookRawEntity.title,
        changedFields: bookChangeRequestRawEntity.changed_fields.split(','),
      },
    });
  });
});
