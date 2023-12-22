import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface ExecutePayload {
  authorIds: string[];
}

export interface ExecuteResult {
  authors: Author[];
}

export type FindAuthorsByIdsQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
