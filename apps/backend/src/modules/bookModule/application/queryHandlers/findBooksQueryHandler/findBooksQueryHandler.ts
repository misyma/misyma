import { type SortOrder, type Language, type FindBooksSortField } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export interface FindBooksQueryHandlerPayload {
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly authorIds?: string[] | undefined;
  readonly language?: Language | undefined;
  readonly releaseYearBefore?: number | undefined;
  readonly releaseYearAfter?: number | undefined;
  readonly isApproved?: boolean | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly sortField?: FindBooksSortField | undefined;
  readonly sortOrder?: SortOrder | undefined;
}

export interface FindBooksQueryHandlerResult {
  readonly books: Book[];
  readonly total: number;
}

export type FindBooksQueryHandler = QueryHandler<FindBooksQueryHandlerPayload, FindBooksQueryHandlerResult>;
