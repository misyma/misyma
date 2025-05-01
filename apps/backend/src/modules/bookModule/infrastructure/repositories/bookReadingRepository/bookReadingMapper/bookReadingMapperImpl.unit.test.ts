import { beforeEach, expect, describe, it } from 'vitest';

import { BookReadingTestFactory } from '../../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';

import { BookReadingMapperImpl } from './bookReadingMapperImpl.js';

describe('BookReadingMapperImpl', () => {
  let bookReadingMapperImpl: BookReadingMapperImpl;

  const bookReadingTestFactory = new BookReadingTestFactory();

  beforeEach(async () => {
    bookReadingMapperImpl = new BookReadingMapperImpl();
  });

  it('maps from bookReading raw entity to domain bookReading', async () => {
    const bookReadingEntity = bookReadingTestFactory.createRaw();

    const bookReading = bookReadingMapperImpl.mapToDomain(bookReadingEntity);

    expect(bookReading).toEqual({
      id: bookReadingEntity.id,
      state: {
        userBookId: bookReadingEntity.user_book_id,
        comment: bookReadingEntity.comment,
        rating: bookReadingEntity.rating,
        startedAt: bookReadingEntity.started_at,
        endedAt: bookReadingEntity.ended_at,
      },
    });
  });
});
