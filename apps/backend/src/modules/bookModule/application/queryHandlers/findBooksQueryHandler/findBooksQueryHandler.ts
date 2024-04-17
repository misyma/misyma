import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface FindBooksQueryHandlerPayload {
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
}

export interface FindBooksQueryHandlerResult {
  readonly books: Book[];
}

export type FindBooksQueryHandler = QueryHandler<FindBooksQueryHandlerPayload, FindBooksQueryHandlerResult>;
