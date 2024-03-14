import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface UpdateBookGenresPayload {
  genreIds: string[];
  bookId: string;
}

export interface UpdateBookGenresResult {
  book: Book;
}

export type UpdateBookGenresCommandHandler = CommandHandler<UpdateBookGenresPayload, UpdateBookGenresResult>;
