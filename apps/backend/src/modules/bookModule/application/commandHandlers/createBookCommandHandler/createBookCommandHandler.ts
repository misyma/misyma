import { type BookFormat, type BookStatus } from '@common/contracts';

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
  readonly frontCoverImageUrl?: string;
  readonly backCoverImageUrl?: string;
  readonly status: BookStatus;
  readonly bookshelfId: string;
  readonly authorIds: string[];
}

export interface CreateBookCommandHandlerResult {
  readonly book: Book;
}

export type CreateBookCommandHandler = CommandHandler<CreateBookCommandHandlerPayload, CreateBookCommandHandlerResult>;
