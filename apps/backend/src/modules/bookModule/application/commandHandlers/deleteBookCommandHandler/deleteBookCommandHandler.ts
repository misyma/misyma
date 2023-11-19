import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBookCommandHandlerPayload {
  readonly bookId: string;
}

export type DeleteBookCommandHandler = CommandHandler<DeleteBookCommandHandlerPayload, void>;
