import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBookshelfPayload {
  readonly bookshelfId: string;
  readonly userId: string;
}

export type DeleteBookshelfCommandHandler = CommandHandler<DeleteBookshelfPayload, void>;
