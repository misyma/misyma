import { type SortingType } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface FindUserBooksQueryHandlerPayload {
  readonly userId?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortingType | undefined;
}

export interface FindUserBooksQueryHandlerResult {
  readonly userBooks: UserBook[];
  readonly total: number;
}

export type FindUserBooksQueryHandler = QueryHandler<FindUserBooksQueryHandlerPayload, FindUserBooksQueryHandlerResult>;
