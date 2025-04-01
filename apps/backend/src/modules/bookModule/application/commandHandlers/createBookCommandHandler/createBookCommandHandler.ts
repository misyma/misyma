import { type Language, type BookFormat } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookCommandHandlerPayload {
  readonly genreId: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear: number;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly authorIds: string[];
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined;
}

export interface CreateBookCommandHandlerResult {
  readonly book: Book;
}

export type CreateBookCommandHandler = CommandHandler<CreateBookCommandHandlerPayload, CreateBookCommandHandlerResult>;
