import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface FindBookQueryHandlerPayload {
  readonly bookId: string;
}

export interface FindBookQueryHandlerResult {
  readonly book: Book;
}

export type FindBookQueryHandler = QueryHandler<FindBookQueryHandlerPayload, FindBookQueryHandlerResult>;
