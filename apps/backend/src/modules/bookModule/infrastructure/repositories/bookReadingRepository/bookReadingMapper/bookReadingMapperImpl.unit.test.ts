import { beforeEach, expect, describe, it } from 'vitest';

import { BookReadingMapperImpl } from './bookReadingMapperImpl.js';
import { BookReadingTestFactory } from '../../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';

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
        userBookId: bookReadingEntity.userBookId,
        comment: bookReadingEntity.comment,
        rating: bookReadingEntity.rating,
        startedAt: new Date(bookReadingEntity.startedAt),
        endedAt: new Date(bookReadingEntity.endedAt as Date),
      },
    });
  });
});
