import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteUserBookCommandHandlerPayload {
  readonly userId: string;
  readonly userBookId: string;
}

export type DeleteUserBookCommandHandler = CommandHandler<DeleteUserBookCommandHandlerPayload, void>;
