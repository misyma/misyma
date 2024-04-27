import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface FindBookshelvesByUserIdPayload {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindBookshelvesByUserIdResult {
  readonly bookshelves: Bookshelf[];
  readonly total: number;
}

export type FindBookshelvesByUserIdQueryHandler = QueryHandler<
  FindBookshelvesByUserIdPayload,
  FindBookshelvesByUserIdResult
>;
