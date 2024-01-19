import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface CreateBookshelfPayload {
  userId: string;
  name: string;
  addressId?: string | undefined;
}

export interface CreateBookshelfResult {
  bookshelf: Bookshelf;
}

export type CreateBookshelfCommandHandler = CommandHandler<CreateBookshelfPayload, CreateBookshelfResult>;
