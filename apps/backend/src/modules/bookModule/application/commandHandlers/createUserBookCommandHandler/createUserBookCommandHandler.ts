import { type ReadingStatus } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface CreateUserBookCommandHandlerPayload {
  readonly bookId: string;
  readonly bookshelfId: string;
  readonly status: ReadingStatus;
  readonly imageUrl?: string | undefined;
}

export interface CreateUserBookCommandHandlerResult {
  readonly userBook: UserBook;
}

export type CreateUserBookCommandHandler = CommandHandler<
  CreateUserBookCommandHandlerPayload,
  CreateUserBookCommandHandlerResult
>;
