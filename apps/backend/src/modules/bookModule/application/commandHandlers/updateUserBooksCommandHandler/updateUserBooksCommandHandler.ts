import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface UpdateUserBooksPayload {
  readonly data: {
    readonly userBookId: string;
    readonly bookshelfId: string;
  }[];
}

export type UpdateUserBooksCommandHandler = CommandHandler<UpdateUserBooksPayload, void>;
