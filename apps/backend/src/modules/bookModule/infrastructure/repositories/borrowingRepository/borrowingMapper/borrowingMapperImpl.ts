import { type BorrowingRawEntity } from '../../../../../databaseModule/infrastructure/tables/borrowingTable/borrowingRawEntity.js';
import { Borrowing } from '../../../../domain/entities/borrowing/borrowing.js';

import { type BorrowingMapper } from './borrowingMapper.js';

export class BorrowingMapperImpl implements BorrowingMapper {
  public mapToDomain({
    id,
    user_book_id: userBookId,
    borrower,
    started_at: startedAt,
    ended_at: endedAt,
  }: BorrowingRawEntity): Borrowing {
    return new Borrowing({
      id,
      userBookId,
      borrower,
      startedAt,
      endedAt,
    });
  }
}
