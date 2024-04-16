import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface ExecutePayload {
  readonly name?: string | undefined;
}

export interface ExecuteResult {
  readonly authors: Author[];
}

export type FindAuthorsQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
