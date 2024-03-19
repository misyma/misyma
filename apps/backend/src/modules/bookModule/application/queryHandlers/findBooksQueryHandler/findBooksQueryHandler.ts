import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface FindBooksResult {
  books: Book[];
}

export type FindBooksQueryHandler = QueryHandler<void, FindBooksResult>;
