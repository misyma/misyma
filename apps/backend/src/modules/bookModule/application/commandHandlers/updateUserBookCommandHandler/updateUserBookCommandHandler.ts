import { type ReadingStatus } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface UpdateUserBookPayload {
  readonly userBookId: string;
  readonly imageUrl?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly status?: ReadingStatus | undefined;
}

export interface UpdateUserBookResult {
  readonly userBook: UserBook;
}

export type UpdateUserBookCommandHandler = CommandHandler<UpdateUserBookPayload, UpdateUserBookResult>;
