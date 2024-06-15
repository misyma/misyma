import { type Borrowing } from './borrowing.js';

export interface CreateBorrowingPathParams {
  readonly userBookId: string;
}

export interface CreateBorrowingRequestBody {
  readonly borrower: string;
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface CreateBorrowingResponseBody extends Borrowing {}
