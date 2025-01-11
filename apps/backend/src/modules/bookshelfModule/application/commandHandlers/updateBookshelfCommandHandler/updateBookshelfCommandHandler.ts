import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface UpdateBookshelfPayload {
  readonly bookshelfId: string;
  readonly userId: string;
  readonly name?: string | undefined;
  readonly imageUrl?: string | undefined | null;
}

export interface UpdateBookshelfResult {
  readonly bookshelf: Bookshelf;
}

export type UpdateBookshelfCommandHandler = CommandHandler<UpdateBookshelfPayload, UpdateBookshelfResult>;
