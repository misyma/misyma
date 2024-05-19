import { type Borrowing } from '../../../../domain/entities/borrowing/borrowing.js';
import { type BorrowingRawEntity } from '../../../databases/bookDatabase/tables/borrowingTable/borrowingRawEntity.js';

export interface BorrowingMapper {
  mapToDomain(rawEntity: BorrowingRawEntity): Borrowing;
}
