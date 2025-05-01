import { beforeEach, expect, describe, it } from 'vitest';

import { BorrowingTestFactory } from '../../../../tests/factories/borrowingTestFactory/borrowingTestFactory.js';

import { BorrowingMapperImpl } from './borrowingMapperImpl.js';

describe('BorrowingMapperImpl', () => {
  let borrowingMapperImpl: BorrowingMapperImpl;

  const borrowingTestFactory = new BorrowingTestFactory();

  beforeEach(async () => {
    borrowingMapperImpl = new BorrowingMapperImpl();
  });

  it('maps from borrowing raw entity to domain borrowing', async () => {
    const borrowingEntity = borrowingTestFactory.createRaw();

    const borrowing = borrowingMapperImpl.mapToDomain(borrowingEntity);

    expect(borrowing).toEqual({
      id: borrowingEntity.id,
      state: {
        userBookId: borrowingEntity.user_book_id,
        borrower: borrowingEntity.borrower,
        startedAt: borrowingEntity.started_at,
        endedAt: borrowingEntity.ended_at,
      },
    });
  });
});
