import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

export interface FindBorrowingsPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindBorrowingsResult {
  readonly borrowings: Borrowing[];
  readonly total: number;
}

export type FindBorrowingsQueryHandler = QueryHandler<FindBorrowingsPayload, FindBorrowingsResult>;
