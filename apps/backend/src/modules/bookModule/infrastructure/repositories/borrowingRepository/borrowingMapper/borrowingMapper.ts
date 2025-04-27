import { type BorrowingRawEntity } from '../../../../../databaseModule/infrastructure/tables/borrowingTable/borrowingRawEntity.js';
import { type Borrowing } from '../../../../domain/entities/borrowing/borrowing.js';

export interface BorrowingMapper {
  mapToDomain(rawEntity: BorrowingRawEntity): Borrowing;
}
