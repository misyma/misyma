import { type SortOrder, type ReadingStatus, type Language } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface FindUserBooksQueryHandlerPayload {
  readonly userId: string;
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly authorId?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly status?: ReadingStatus | undefined;
  readonly isFavorite?: boolean | undefined;
  readonly language?: Language | undefined;
  readonly releaseYearAfter?: number | undefined;
  readonly releaseYearBefore?: number | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly sortField?: 'releaseYear' | 'createdAt' | 'rating' | 'readingDate' | undefined;
  readonly sortOrder?: SortOrder | undefined;
  readonly isRated?: boolean | undefined;
}

export interface FindUserBooksQueryHandlerResult {
  readonly userBooks: UserBook[];
  readonly total: number;
}

export type FindUserBooksQueryHandler = QueryHandler<FindUserBooksQueryHandlerPayload, FindUserBooksQueryHandlerResult>;
