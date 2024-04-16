import { type Language, type BookFormat } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookCommandHandlerPayload {
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: Language;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly authorIds: string[];
  readonly isApproved: boolean;
  readonly imageUrl?: string;
}

export interface CreateBookCommandHandlerResult {
  readonly book: Book;
}

export type CreateBookCommandHandler = CommandHandler<CreateBookCommandHandlerPayload, CreateBookCommandHandlerResult>;
