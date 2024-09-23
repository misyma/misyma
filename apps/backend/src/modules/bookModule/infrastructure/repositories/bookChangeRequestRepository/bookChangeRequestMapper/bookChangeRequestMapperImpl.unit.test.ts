import { beforeEach, expect, describe, it } from 'vitest';

import { BookChangeRequestMapperImpl } from './bookChangeRequestMapperImpl.js';
import { BookChangeRequestTestFactory } from '../../../../tests/factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';
import { BookTestFactory } from '../../../../tests/factories/bookTestFactory/bookTestFactory.js';

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
        bookIsbn: bookRawEntity.isbn as string,
        bookPublisher: bookRawEntity.publisher as string,
        bookReleaseYear: bookRawEntity.releaseYear as number,
        bookLanguage: bookRawEntity.language,
        bookTranslator: bookRawEntity.translator as string,
        bookFormat: bookRawEntity.format,
        bookPages: bookRawEntity.pages as number,
        bookIsApproved: bookRawEntity.isApproved,
        bookImageUrl: bookRawEntity.imageUrl as string,
        bookCreatedAt: bookRawEntity.createdAt,
        bookAuthorIds: [],
        bookAuthorNames: [],
        bookAuthorApprovals: [],
        bookAuthorCreatedAtDates: [],
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

        book: {
          id: bookChangeRequestRawEntity.bookId,
          title: bookRawEntity.title,
          isbn: bookRawEntity.isbn,
          publisher: bookRawEntity.publisher,
          releaseYear: bookRawEntity.releaseYear,
          language: bookRawEntity.language,
          translator: bookRawEntity.translator,
          format: bookRawEntity.format,
          pages: bookRawEntity.pages,
          isApproved: bookRawEntity.isApproved,
          imageUrl: bookRawEntity.imageUrl,
          createdAt: bookRawEntity.createdAt,
          authors: [],
        },
      },
    });
  });
});
