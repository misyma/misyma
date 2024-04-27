import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface ExecutePayload {
  readonly authorIds: string[];
  readonly page: number;
  readonly pageSize: number;
}

export interface ExecuteResult {
  readonly authors: Author[];
  readonly total: number;
}

export type FindAuthorsByIdsQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
