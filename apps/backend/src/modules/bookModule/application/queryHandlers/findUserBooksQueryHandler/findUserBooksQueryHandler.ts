import { type UserBookExpandField, type SortingType, type ReadingStatus, type Language } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface FindUserBooksQueryHandlerPayload {
  readonly userId: string;
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly authorId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly status?: ReadingStatus | undefined;
  readonly isFavorite?: boolean | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly releaseAfter?: Date | undefined;
  readonly language?: Language | undefined;
  readonly sortDate?: SortingType | undefined;
  readonly expandFields: UserBookExpandField[] | undefined;
}

export interface FindUserBooksQueryHandlerResult {
  readonly userBooks: UserBook[];
  readonly total: number;
}

export type FindUserBooksQueryHandler = QueryHandler<FindUserBooksQueryHandlerPayload, FindUserBooksQueryHandlerResult>;
