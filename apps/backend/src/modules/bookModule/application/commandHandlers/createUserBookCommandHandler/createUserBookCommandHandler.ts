import { type ReadingStatus } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface CreateUserBookCommandHandlerPayload {
  readonly userId: string;
  readonly bookId: string;
  readonly bookshelfId: string;
  readonly status: ReadingStatus;
  readonly imageUrl?: string | undefined;
  readonly collectionIds?: string[] | undefined;
  readonly isFavorite: boolean;
}

export interface CreateUserBookCommandHandlerResult {
  readonly userBook: UserBook;
}

export type CreateUserBookCommandHandler = CommandHandler<
  CreateUserBookCommandHandlerPayload,
  CreateUserBookCommandHandlerResult
>;
