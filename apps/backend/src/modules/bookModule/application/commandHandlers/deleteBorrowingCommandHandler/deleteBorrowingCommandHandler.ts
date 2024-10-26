import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBorrowingPayload {
  readonly userId: string;
  readonly borrowingId: string;
}

export type DeleteBorrowingCommandHandler = CommandHandler<DeleteBorrowingPayload, void>;
