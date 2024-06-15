import { type SortingType } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

export interface FindBorrowingsQueryHandlerPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortingType | undefined;
}

export interface FindBorrowingsQueryHandlerResult {
  readonly borrowings: Borrowing[];
  readonly total: number;
}

export type FindBorrowingsQueryHandler = QueryHandler<
  FindBorrowingsQueryHandlerPayload,
  FindBorrowingsQueryHandlerResult
>;
