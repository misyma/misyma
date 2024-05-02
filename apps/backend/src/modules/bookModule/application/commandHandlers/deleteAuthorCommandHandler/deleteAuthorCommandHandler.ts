import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteAuthorCommandHandlerPayload {
  readonly authorId: string;
}

export type DeleteAuthorCommandHandler = CommandHandler<DeleteAuthorCommandHandlerPayload, void>;
