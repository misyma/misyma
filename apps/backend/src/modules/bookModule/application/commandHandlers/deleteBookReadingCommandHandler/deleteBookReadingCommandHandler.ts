import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBookReadingPayload {
  readonly userId: string;
  readonly bookReadingId: string;
}

export type DeleteBookReadingCommandHandler = CommandHandler<DeleteBookReadingPayload, void>;
