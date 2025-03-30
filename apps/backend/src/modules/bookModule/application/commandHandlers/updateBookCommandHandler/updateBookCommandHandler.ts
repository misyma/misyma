import { type BookFormat, type Language } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface UpdateBookPayload {
  readonly bookId: string;
  readonly genreId?: string | undefined;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly isApproved?: boolean | undefined;
  readonly authorIds?: string[] | undefined;
}

export interface UpdateBookResult {
  readonly book: Book;
}

export type UpdateBookCommandHandler = CommandHandler<UpdateBookPayload, UpdateBookResult>;
