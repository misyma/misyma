import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface CreateBookCommandHandlerPayload {
  readonly title: string;
  readonly releaseYear: number;
  readonly authorsIds: string[];
}

export interface CreateBookCommandHandlerResult {
  readonly book: Book;
}

export type CreateBookCommandHandler = CommandHandler<CreateBookCommandHandlerPayload, CreateBookCommandHandlerResult>;
