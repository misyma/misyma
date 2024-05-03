import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface FindBookshelfByIdPayload {
  readonly bookshelfId: string;
  readonly userId: string;
}

export interface FindBookshelfByIdResult {
  readonly bookshelf: Bookshelf;
}

export type FindBookshelfByIdQueryHandler = QueryHandler<FindBookshelfByIdPayload, FindBookshelfByIdResult>;
