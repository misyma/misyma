import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface FindBookshelvesByUserIdPayload {
  userId: string;
}

export interface FindBookshelvesByUserIdResult {
  bookshelves: Bookshelf[];
}

export type FindBookshelvesByUserIdQueryHandler = QueryHandler<
  FindBookshelvesByUserIdPayload,
  FindBookshelvesByUserIdResult
>;
