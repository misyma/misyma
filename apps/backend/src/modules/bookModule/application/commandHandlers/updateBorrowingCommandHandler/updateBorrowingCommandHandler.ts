import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

export interface UpdateBorrowingPayload {
  readonly userId: string;
  readonly borrowingId: string;
  readonly borrower?: string | undefined;
  readonly startedAt?: Date | undefined;
  readonly endedAt?: Date | undefined;
}

export interface UpdateBorrowingResult {
  readonly borrowing: Borrowing;
}

export type UpdateBorrowingCommandHandler = CommandHandler<UpdateBorrowingPayload, UpdateBorrowingResult>;
