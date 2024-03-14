import { type BookFormat, type ReadingStatus } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookCommandHandlerPayload {
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: string;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly imageUrl?: string;
  readonly status: ReadingStatus;
  readonly bookshelfId: string;
  readonly authorIds: string[];
}

export interface CreateBookCommandHandlerResult {
  readonly book: Book;
}

export type CreateBookCommandHandler = CommandHandler<CreateBookCommandHandlerPayload, CreateBookCommandHandlerResult>;
