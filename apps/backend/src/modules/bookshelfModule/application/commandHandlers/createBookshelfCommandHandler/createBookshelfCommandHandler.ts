import { type BookshelfType } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface CreateBookshelfPayload {
  readonly userId: string;
  readonly name: string;
  readonly type: BookshelfType;
}

export interface CreateBookshelfResult {
  readonly bookshelf: Bookshelf;
}

export type CreateBookshelfCommandHandler = CommandHandler<CreateBookshelfPayload, CreateBookshelfResult>;
