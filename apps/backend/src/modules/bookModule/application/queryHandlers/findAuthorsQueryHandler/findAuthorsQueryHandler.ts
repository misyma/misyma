import { type FindAuthorsSortField, type SortOrder } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface ExecutePayload {
  readonly ids?: string[] | undefined;
  readonly name?: string | undefined;
  readonly isApproved?: boolean | undefined;
  readonly userId?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly sortField?: FindAuthorsSortField | undefined;
  readonly sortOrder?: SortOrder | undefined;
}

export interface ExecuteResult {
  readonly authors: Author[];
  readonly total: number;
}

export type FindAuthorsQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
