import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBookChangeRequestCommandHandlerPayload {
  readonly bookChangeRequestId: string;
}

export type DeleteBookChangeRequestCommandHandler = CommandHandler<DeleteBookChangeRequestCommandHandlerPayload, void>;
