import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBookReadingPayload {
  id: string;
}

export type DeleteBookReadingCommandHandler = CommandHandler<DeleteBookReadingPayload, void>;
