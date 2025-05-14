import { Generator } from '../../../../../../tests/generator.js';
import { type BorrowingRawEntity } from '../../../../databaseModule/infrastructure/tables/borrowingsTable/borrowingRawEntity.js';
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
      user_book_id: Generator.uuid(),
      borrower: Generator.fullName(),
      started_at: Generator.pastDate(),
      ended_at: Generator.futureDate(),
      ...input,
    };
  }
}
