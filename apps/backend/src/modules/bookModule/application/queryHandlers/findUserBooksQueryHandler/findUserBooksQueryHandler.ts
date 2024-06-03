import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface FindUserBooksPayload {
  readonly userId?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindUserBooksResult {
  readonly userBooks: UserBook[];
  readonly total: number;
}

export type FindUserBooksQueryHandler = QueryHandler<FindUserBooksPayload, FindUserBooksResult>;
