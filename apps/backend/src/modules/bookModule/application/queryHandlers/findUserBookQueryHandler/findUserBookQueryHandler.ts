import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface FindUserBookQueryHandlerPayload {
  readonly userBookId: string;
}

export interface FindUserBookQueryHandlerResult {
  readonly userBook: UserBook;
}

export type FindUserBookQueryHandler = QueryHandler<FindUserBookQueryHandlerPayload, FindUserBookQueryHandlerResult>;
