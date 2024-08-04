import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

export interface CreateBorrowingPayload {
  readonly userBookId: string;
  readonly borrower: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
  readonly userId: string;
}

export interface CreateBorrowingResult {
  readonly borrowing: Borrowing;
}

export type CreateBorrowingCommandHandler = CommandHandler<CreateBorrowingPayload, CreateBorrowingResult>;
