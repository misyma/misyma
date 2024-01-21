import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface UpdateBookshelfNamePayload {
  id: string;
  userId: string;
  name: string;
}

export interface UpdateBookshelfNameResult {
  bookshelf: Bookshelf;
}

export type UpdateBookshelfNameCommandHandler = CommandHandler<UpdateBookshelfNamePayload, UpdateBookshelfNameResult>;
