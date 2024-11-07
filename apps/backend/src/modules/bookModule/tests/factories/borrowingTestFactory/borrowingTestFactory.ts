import { Generator } from '../../../../../../tests/generator.js';
import { type BorrowingRawEntity } from '../../../../bookModule/infrastructure/databases/bookDatabase/tables/borrowingTable/borrowingRawEntity.js';
import { type BorrowingState, Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

export class BorrowingTestFactory {
  public create(input: Partial<BorrowingState> = {}): Borrowing {
    return new Borrowing({
      id: Generator.uuid(),
      userBookId: Generator.uuid(),
      borrower: Generator.fullName(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.futureDate(),
      ...input,
    });
  }

  public createRaw(input: Partial<BorrowingRawEntity> = {}): BorrowingRawEntity {
    return {
      id: Generator.uuid(),
      userBookId: Generator.uuid(),
      borrower: Generator.fullName(),
      startedAt: Generator.pastDate(),
      endedAt: Generator.futureDate(),
      ...input,
    };
  }
}
