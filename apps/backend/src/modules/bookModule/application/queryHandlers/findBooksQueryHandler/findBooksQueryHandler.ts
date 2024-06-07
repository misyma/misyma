import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface FindBooksQueryHandlerPayload {
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly isApproved?: boolean | undefined;
}

export interface FindBooksQueryHandlerResult {
  readonly books: Book[];
  readonly total: number;
}

export type FindBooksQueryHandler = QueryHandler<FindBooksQueryHandlerPayload, FindBooksQueryHandlerResult>;
