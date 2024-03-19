import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBookReadingPayload {
  readonly id: string;
}

export type DeleteBookReadingCommandHandler = CommandHandler<DeleteBookReadingPayload, void>;
