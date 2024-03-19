import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface UpdateBookGenresPayload {
  readonly genreIds: string[];
  readonly bookId: string;
}

export interface UpdateBookGenresResult {
  readonly book: Book;
}

export type UpdateBookGenresCommandHandler = CommandHandler<UpdateBookGenresPayload, UpdateBookGenresResult>;
