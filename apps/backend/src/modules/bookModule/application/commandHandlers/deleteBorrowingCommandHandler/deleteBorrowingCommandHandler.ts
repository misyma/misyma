import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBorrowingPayload {
  readonly id: string;
}

export type DeleteBorrowingCommandHandler = CommandHandler<DeleteBorrowingPayload, void>;
