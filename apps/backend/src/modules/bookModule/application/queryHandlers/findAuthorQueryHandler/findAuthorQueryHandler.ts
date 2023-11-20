import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface FindAuthorQueryHandlerPayload {
  readonly authorId: string;
}

export interface FindAuthorQueryHandlerResult {
  readonly author: Author;
}

export type FindAuthorQueryHandler = QueryHandler<FindAuthorQueryHandlerPayload, FindAuthorQueryHandlerResult>;
