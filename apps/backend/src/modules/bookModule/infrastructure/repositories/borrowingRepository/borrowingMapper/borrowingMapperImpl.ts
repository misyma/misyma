import { Borrowing } from '../../../../domain/entities/borrowing/borrowing.js';
import { type BorrowingRawEntity } from '../../../databases/bookDatabase/tables/borrowingTable/borrowingRawEntity.js';

import { type BorrowingMapper } from './borrowingMapper.js';

export class BorrowingMapperImpl implements BorrowingMapper {
  public mapToDomain({ id, userBookId, borrower, startedAt, endedAt }: BorrowingRawEntity): Borrowing {
    return new Borrowing({
      id,
      userBookId,
      borrower,
      startedAt,
      endedAt,
    });
  }
}
