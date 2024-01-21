import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface FindBookshelfByIdPayload {
  id: string;
  userId: string;
}

export interface FindBookshelfByIdResult {
  bookshelf: Bookshelf;
}

export type FindBookshelfByIdQueryHandler = QueryHandler<FindBookshelfByIdPayload, FindBookshelfByIdResult>;
