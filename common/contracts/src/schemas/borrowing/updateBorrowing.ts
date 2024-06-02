import { type Borrowing } from './borrowing.js';

export interface UpdateBorrowingRequestBody {
  readonly borrower?: string;
  readonly startedAt?: string;
  readonly endedAt?: string;
}

export interface UpdateBorrowingPathParams {
  readonly borrowingId: string;
}

export interface UpdateBorrowingResponseBody extends Borrowing {}
