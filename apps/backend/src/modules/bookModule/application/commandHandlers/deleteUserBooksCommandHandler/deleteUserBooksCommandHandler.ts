import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteUserBooksCommandHandlerPayload {
  readonly userBookIds: string[];
}

export type DeleteUserBooksCommandHandler = CommandHandler<DeleteUserBooksCommandHandlerPayload, void>;
