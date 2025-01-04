import { type SortOrder } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

export interface FindBorrowingsQueryHandlerPayload {
  readonly userId: string;
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortOrder | undefined;
  readonly isOpen?: boolean | undefined;
}

export interface FindBorrowingsQueryHandlerResult {
  readonly borrowings: Borrowing[];
  readonly total: number;
}

export type FindBorrowingsQueryHandler = QueryHandler<
  FindBorrowingsQueryHandlerPayload,
  FindBorrowingsQueryHandlerResult
>;
